////menuController.js
const db = require('../utils/dbManager');

// GET /api/menu
const getAllMenuItems = async(req, res) => {
  try {
    const { restaurantId } = req.query;
    let items = (await db.getAllMenus()).filter(m => m.isAvailable);
    if (restaurantId) items = items.filter(m => m.restaurantId === restaurantId);
    res.json({ success: true, data: items });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/restaurant/:restaurantId
const getMenuByRestaurant = async(req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId || restaurantId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    const restaurant = await db.getRestaurant(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const items = (await db.getMenuByRestaurant(restaurantId)).filter(m => m.isAvailable);
    res.json({ success: true, data: items });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/owner/restaurant/:restaurantId
const getMenuByRestaurantOwner = async(req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId || restaurantId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    }

    const restaurant = await db.getRestaurant(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const items = await db.getMenuByRestaurant(restaurantId);
    res.json({ success: true, data: items });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/search
const searchMenuItems = async(req, res) => {
  try {
    const { search } = req.query;
    let items = (await db.getAllMenus()).filter(m => m.isAvailable);
    if (search) {
      items = items.filter(m => m.itemName.toLowerCase().includes(search.toLowerCase()));
    }
    res.json({ success: true, data: items });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/menu
const addMenuItem = async(req, res) => {
  try {
    const { restaurantId, itemName, price, description, isVeg, category, image } = req.body;

    if (!restaurantId || restaurantId.trim().length === 0)
      return res.status(400).json({ success: false, message: 'restaurantId is required' });
    if (!itemName || itemName.trim().length === 0)
      return res.status(400).json({ success: false, message: 'itemName is required' });
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
      return res.status(400).json({ success: false, message: 'price must be a non-negative number' });
    if (!category || category.trim().length === 0)
      return res.status(400).json({ success: false, message: 'category is required' });

    const restaurant = await db.getRestaurant(restaurantId);
    if (!restaurant)
      return res.status(404).json({ success: false, message: `Restaurant '${restaurantId}' not found` });

    const item = await db.createMenuItem({
      restaurantId,
      itemName: itemName.trim(),
      price: Number(price),
      description: description || '',
      isVeg: !!isVeg,
      category: category.trim(),
      image: image || '',
      isAvailable: true
    });

    res.status(201).json({ success: true, message: 'Menu item added', data: item });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/menu/:id
const updateMenuItem = async(req, res) => {
  try {
    const existing = await db.getMenuItem(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const { itemName, price, description, isVeg, category, isAvailable, image } = req.body;
    const updates = {};
    if (itemName !== undefined)     updates.itemName = itemName;
    if (price !== undefined)        updates.price = Number(price);
    if (description !== undefined)  updates.description = description;
    if (isVeg !== undefined)        updates.isVeg = !!isVeg;
    if (category !== undefined)     updates.category = category;
    if (isAvailable !== undefined)  updates.isAvailable = !!isAvailable;
    if (image !== undefined)        updates.image = image;

    const item = await db.updateMenuItem(req.params.id, updates);
    res.json({ success: true, message: 'Menu item updated', data: item });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/menu/:id
const deleteMenuItem = async(req, res) => {
  try {
    const item = await db.deleteMenuItem(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/menu/:id
const getMenuItemById = async(req, res) => {
  try {
    const item = await db.getMenuItem(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, data: item });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllMenuItems, getMenuByRestaurant, getMenuByRestaurantOwner, searchMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, getMenuItemById };