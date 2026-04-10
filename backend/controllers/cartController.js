const { getAllCarts, getCartByUserId, addCart, updateCart: dbUpdateCart, deleteCart: dbDeleteCart, getMenuById, getRestaurantById, findUserById } = require('../utils/dbManager');

// ── HELPER: Recalculate totalAmount ───────────────────────────────────────────
const calcTotal = (items) =>
  items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

// ── GET ALL CARTS ──────────────────────────────────────────────────────────────
// GET /api/carts?userId=usr_001&restaurantId=rest_001&page=1&limit=10
const getCarts = async (req, res) => {
  try {
    const { userId, restaurantId, page = 1, limit = 10 } = req.query;
    
    let carts = getAllCarts();

    if (userId) {
      carts = carts.filter(c => String(c.userId) === String(userId));
    }

    if (restaurantId) {
      carts = carts.filter(c => String(c.restaurantId) === String(restaurantId));
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const total = carts.length;

    const paginatedCarts = carts.slice(skip, skip + limitNum);

    res.json({ success: true, total, page: pageNum, limit: limitNum, data: paginatedCarts });
  } catch (error) {
    console.error('Error in getCarts:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE CART ────────────────────────────────────────────────────────────
// GET /api/carts/:id
const getCart = async (req, res) => {
  try {
    const carts = getAllCarts();
    const cart = carts.find(c => String(c.id) === String(req.params.id));
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET CART BY USER ───────────────────────────────────────────────────────────
// GET /api/carts/user/:userId
const getCartByUser = async (req, res) => {
  try {
    const carts = getAllCarts().filter(c => String(c.userId) === String(req.params.userId));
    res.json({ success: true, data: carts });
  } catch (error) {
    console.error('Error in getCartByUser:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE CART ────────────────────────────────────────────────────────────────
// POST /api/carts
// If cart exists for user+restaurant, merges items instead of creating new
const createCart = async (req, res) => {
  try {
    const { userId, restaurantId, items } = req.body;

    if (!userId || !restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'userId, restaurantId and items[] are required' });
    }

    // Verify user exists
    if (!findUserById(userId)) {
      return res.status(404).json({ success: false, message: `User '${userId}' not found` });
    }

    // Verify restaurant exists
    if (!getRestaurantById(restaurantId)) {
      return res.status(404).json({ success: false, message: `Restaurant '${restaurantId}' not found` });
    }

    // Check if user already has a cart with different restaurant
    const existingCart = getAllCarts().find(c => String(c.userId) === String(userId) && String(c.restaurantId) !== String(restaurantId));
    if (existingCart) {
      return res.status(400).json({ success: false, message: 'You can only add items from one restaurant at a time. Clear your cart first.' });
    }

    // Check if cart already exists for this user and restaurant
    let cart = getAllCarts().find(c => String(c.userId) === String(userId) && String(c.restaurantId) === String(restaurantId));
    
    if (cart) {
      // Merge items into existing cart
      for (const newItem of items) {
        if (!newItem.itemId || !newItem.quantity || newItem.price === undefined) {
          return res.status(400).json({ success: false, message: 'Each item must have itemId, quantity and price' });
        }

        const menuItem = getMenuById(newItem.itemId);
        if (!menuItem || String(menuItem.restaurantId) !== String(restaurantId)) {
          return res.status(404).json({
            success: false,
            message: `Menu item '${newItem.itemId}' not found in restaurant '${restaurantId}'`
          });
        }

        const existingIndex = cart.items.findIndex(i => String(i.itemId) === String(newItem.itemId));
        if (existingIndex !== -1) {
          cart.items[existingIndex].quantity += newItem.quantity;
        } else {
          cart.items.push({ itemId: newItem.itemId, quantity: newItem.quantity, price: newItem.price });
        }
      }
      cart.totalAmount = calcTotal(cart.items);
      
      const updated = dbUpdateCart(cart.id, { items: cart.items, totalAmount: cart.totalAmount });
      return res.status(200).json({
        success: true,
        message: 'Items added to existing cart',
        data: updated,
        summary: { itemCount: updated.items.length, totalItems: updated.items.reduce((sum, item) => sum + item.quantity, 0) }
      });
    }

    // Validate every item: must exist in menu and belong to this restaurant
    for (const item of items) {
      if (!item.itemId || !item.quantity || item.price === undefined) {
        return res.status(400).json({ success: false, message: 'Each item must have itemId, quantity and price' });
      }
      const menuItem = getMenuById(item.itemId);
      if (!menuItem || String(menuItem.restaurantId) !== String(restaurantId)) {
        return res.status(404).json({
          success: false,
          message: `Menu item '${item.itemId}' not found in restaurant '${restaurantId}'`
        });
      }
    }

    const totalAmount = calcTotal(items);
    const cartId = req.body.id || `cart_${Date.now()}`;

    const newCart = addCart({
      id: cartId,
      userId,
      restaurantId,
      items,
      totalAmount
    });

    if (!newCart) {
      return res.status(500).json({ success: false, message: 'Failed to create cart' });
    }

    res.status(201).json({
      success: true,
      data: newCart,
      summary: { itemCount: newCart.items.length, totalItems: newCart.items.reduce((sum, item) => sum + item.quantity, 0) }
    });
  } catch (error) {
    console.error('Error in createCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE CART ────────────────────────────────────────────────────────────────
// PUT /api/carts/:id
const updateCart = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id; // prevent id override

    // Recalculate totalAmount if items are being updated
    if (Array.isArray(updates.items)) {
      updates.totalAmount = calcTotal(updates.items);
    }

    const updated = dbUpdateCart(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── ADD ITEM TO CART ───────────────────────────────────────────────────────────
// POST /api/carts/add-item
const addItemToCart = async (req, res) => {
  try {
    const { cartId, itemId, quantity } = req.body;

    if (!cartId || !itemId || !quantity) {
      return res.status(400).json({ success: false, message: 'cartId, itemId and quantity are required' });
    }

    const carts = getAllCarts();
    let cart = carts.find(c => String(c.id) === String(cartId));
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Validate item belongs to cart's restaurant
    const menuItem = getMenuById(itemId);
    if (!menuItem || String(menuItem.restaurantId) !== String(cart.restaurantId)) {
      return res.status(404).json({
        success: false,
        message: `Item '${itemId}' not found in restaurant '${cart.restaurantId}'`
      });
    }

    const existingIndex = cart.items.findIndex(i => String(i.itemId) === String(itemId));
    if (existingIndex !== -1) {
      cart.items[existingIndex].quantity += parseInt(quantity);
    } else {
      cart.items.push({ itemId, quantity: parseInt(quantity), price: menuItem.price });
    }

    cart.totalAmount = calcTotal(cart.items);
    const updated = dbUpdateCart(cartId, { items: cart.items, totalAmount: cart.totalAmount });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: updated,
      summary: { itemCount: updated.items.length, totalItems: updated.items.reduce((sum, item) => sum + item.quantity, 0) }
    });
  } catch (error) {
    console.error('Error in addItemToCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ITEM QUANTITY ──────────────────────────────────────────────────────
// PUT /api/carts/update-quantity
const updateItemQuantity = async (req, res) => {
  try {
    const { cartId, itemId, quantityChange } = req.body;

    if (!cartId || !itemId || quantityChange === undefined) {
      return res.status(400).json({ success: false, message: 'cartId, itemId and quantityChange are required' });
    }

    const carts = getAllCarts();
    let cart = carts.find(c => String(c.id) === String(cartId));
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(i => String(i.itemId) === String(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: `Item '${itemId}' not in cart` });
    }

    cart.items[itemIndex].quantity += parseInt(quantityChange);

    // Remove item if quantity becomes 0 or negative
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    cart.totalAmount = calcTotal(cart.items);
    const updated = dbUpdateCart(cartId, { items: cart.items, totalAmount: cart.totalAmount });

    res.json({
      success: true,
      message: 'Item quantity updated',
      data: updated,
      summary: { itemCount: updated.items.length, totalItems: updated.items.reduce((sum, item) => sum + item.quantity, 0) }
    });
  } catch (error) {
    console.error('Error in updateItemQuantity:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── REMOVE ITEM FROM CART ──────────────────────────────────────────────────────
// POST /api/carts/remove-item
const removeItemFromCart = async (req, res) => {
  try {
    const { cartId, itemId, quantity } = req.body;

    if (!cartId || !itemId) {
      return res.status(400).json({ success: false, message: 'cartId and itemId are required' });
    }

    const carts = getAllCarts();
    let cart = carts.find(c => String(c.id) === String(cartId));
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(i => String(i.itemId) === String(itemId));
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: `Item '${itemId}' not in cart` });
    }

    if (quantity && quantity > 0) {
      // Subtract quantity
      cart.items[itemIndex].quantity -= parseInt(quantity);
      if (cart.items[itemIndex].quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      }
    } else {
      // Remove entire item
      cart.items.splice(itemIndex, 1);
    }

    cart.totalAmount = calcTotal(cart.items);
    const updated = dbUpdateCart(cartId, { items: cart.items, totalAmount: cart.totalAmount });

    res.json({
      success: true,
      message: quantity ? 'Item quantity reduced' : 'Item removed from cart',
      data: updated,
      summary: { itemCount: updated.items.length, totalItems: updated.items.reduce((sum, item) => sum + item.quantity, 0) }
    });
  } catch (error) {
    console.error('Error in removeItemFromCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE CART ────────────────────────────────────────────────────────────────
// DELETE /api/carts/:id
const deleteCart = async (req, res) => {
  try {
    const success = dbDeleteCart(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    res.json({ success: true, message: 'Cart deleted' });
  } catch (error) {
    console.error('Error in deleteCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCarts,
  getCart,
  getCartByUser,
  createCart,
  updateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  deleteCart
};
