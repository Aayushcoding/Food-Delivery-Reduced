// controllers/orderController.js
// Using db.json for data persistence (NO MongoDB)

const { getAllOrders, getOrderById, getOrdersByUserId, getOrdersByRestaurantId, addOrder, updateOrder: dbUpdateOrder, getRestaurantsByOwner, getAllCarts, getCartByUserId, updateCart: dbUpdateCart, findUserById, getAvailableDeliveryAgents, updateDeliveryAgent } = require('../utils/dbManager');

// ── GET ALL ORDERS ─────────────────────────────────────────────────────────────
// GET /api/orders?userId=usr_001&ownerId=usr_owner_001&restaurantId=rest_001&status=Pending
const getOrders = async (req, res) => {
  try {
    const {
      userId, restaurantId, ownerId, status, deliveryAgentId,
      page = 1, limit = 10, sortBy = 'createdAt', order = 'desc'
    } = req.query;

    let orders = getAllOrders();

    // Apply filters
    if (userId) {
      orders = orders.filter(o => String(o.userId) === String(userId));
    }

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    if (deliveryAgentId) {
      orders = orders.filter(o => String(o.deliveryAgentId) === String(deliveryAgentId));
    }

    if (ownerId) {
      const owned = getRestaurantsByOwner(ownerId);
      const ids = owned.map(r => String(r.id));
      if (ids.length === 0) {
        return res.json({ success: true, total: 0, page: parseInt(page), limit: parseInt(limit), data: [] });
      }
      orders = orders.filter(o => ids.includes(String(o.restaurantId)));
    } else if (restaurantId) {
      orders = orders.filter(o => String(o.restaurantId) === String(restaurantId));
    }

    // Apply sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    orders.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === 'totalAmount') {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      }

      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const total = orders.length;

    const paginatedOrders = orders.slice(skip, skip + limitNum);

    res.json({ success: true, total, page: pageNum, limit: limitNum, data: paginatedOrders });
  } catch (error) {
    console.error('Error in getOrders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ORDER ───────────────────────────────────────────────────────────
// GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error in getOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE ORDER (direct) ──────────────────────────────────────────────────────
// POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { userId, restaurantId, items, deliveryAgentId } = req.body;

    if (!userId || !restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'userId, restaurantId and items[] are required' });
    }

    const totalAmount = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);

    const newOrder = addOrder({
      orderId: req.body.orderId || `order_${Date.now()}`,
      userId,
      restaurantId,
      items,
      totalAmount,
      status: req.body.status || 'Pending',
      deliveryAgentId: deliveryAgentId || null,
      date: new Date().toISOString()
    });

    if (!newOrder) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PLACE ORDER FROM CART ──────────────────────────────────────────────────────
// POST /api/orders/place-from-cart
const placeOrderFromCart = async (req, res) => {
  try {
    const { cartId, deliveryAgentId } = req.body;

    if (!cartId) {
      return res.status(400).json({ success: false, message: 'cartId is required' });
    }

    // Fetch cart
    const allCarts = getAllCarts();
    const cart = allCarts.find(c => String(c.id) === String(cartId));
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // Verify user exists
    if (!findUserById(cart.userId)) {
      return res.status(404).json({ success: false, message: `User '${cart.userId}' not found` });
    }

    // Resolve delivery agent
    let assignedAgentId = deliveryAgentId || null;
    if (!assignedAgentId) {
      // Auto-assign first available agent
      const agents = getAvailableDeliveryAgents();
      if (agents.length > 0) {
        const agent = agents[0];
        assignedAgentId = agent.id;
        // Mark agent as unavailable
        updateDeliveryAgent(agent.id, { available: false });
      }
    }

    // Build order items from cart
    const orderItems = cart.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price
    }));

    const newOrder = addOrder({
      orderId: `order_${Date.now()}`,
      userId: cart.userId,
      restaurantId: cart.restaurantId,
      items: orderItems,
      totalAmount: cart.totalAmount,
      status: 'Pending',
      deliveryAgentId: assignedAgentId,
      date: new Date().toISOString()
    });

    if (!newOrder) {
      return res.status(500).json({ success: false, message: 'Failed to place order' });
    }

    // Clear the cart after placing order
    dbUpdateCart(cartId, { items: [], totalAmount: 0 });

    const message = assignedAgentId
      ? 'Order placed successfully'
      : 'Order placed successfully, but no delivery agent available - pending assignment';

    res.status(201).json({ success: true, message, data: newOrder });
  } catch (error) {
    console.error('Error in placeOrderFromCart:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE ORDER ───────────────────────────────────────────────────────────────
// PUT /api/orders/:id
const updateOrder = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.id; // prevent id change

    const validStatuses = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (updates.status && !validStatuses.includes(updates.status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    const updated = dbUpdateOrder(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // If order is Delivered, free up the delivery agent
    if (updates.status === 'Delivered' && updated.deliveryAgentId) {
      updateDeliveryAgent(updated.deliveryAgentId, { available: true });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE ORDER ───────────────────────────────────────────────────────────────
// DELETE /api/orders/:id
const deleteOrder = async (req, res) => {
  try {
    const order = getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Free up delivery agent if order had one
    if (order.deliveryAgentId) {
      updateDeliveryAgent(order.deliveryAgentId, { available: true });
    }

    const db = require('../utils/dbManager').readDB();
    db.orders = db.orders.filter(o => String(o.id) !== String(req.params.id));
    require('../utils/dbManager').writeDB(db);

    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getOrders, getOrder, createOrder, placeOrderFromCart, updateOrder, deleteOrder };
