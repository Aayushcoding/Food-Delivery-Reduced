// controllers/menuController.js
// Using db.json for data persistence (NO MongoDB)

const { getAllMenus, getMenuById, getMenusByRestaurant, addMenu, updateMenu: dbUpdateMenu, getRestaurantById } = require('../utils/dbManager');

// ── GET ALL MENU ITEMS ─────────────────────────────────────────────────────────
// GET /api/menu?restaurantId=rest_001&isVeg=true&category=Indian&search=biryani&page=1&limit=10
const getMenus = async (req, res) => {
  try {
    const {
      restaurantId, isVeg, category, search, page = 1, limit = 10, sortBy = 'itemName', order = 'asc'
    } = req.query;

    let menus = getAllMenus();

    // Apply filters
    if (restaurantId) {
      menus = menus.filter(m => String(m.restaurantId) === String(restaurantId));
    }

    if (isVeg !== undefined) {
      menus = menus.filter(m => String(m.isVeg) === String(isVeg === 'true'));
    }

    if (category) {
      const categoryLower = String(category).toLowerCase();
      menus = menus.filter(m => String(m.category || '').toLowerCase() === categoryLower);
    }

    if (search) {
      const searchLower = String(search).toLowerCase();
      menus = menus.filter(m =>
        String(m.itemName).toLowerCase().includes(searchLower) ||
        String(m.description || '').toLowerCase().includes(searchLower) ||
        String(m.category || '').toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    menus.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const total = menus.length;

    const paginatedMenus = menus.slice(skip, skip + limitNum);

    res.json({ success: true, total, page: pageNum, limit: limitNum, data: paginatedMenus });
  } catch (error) {
    console.error('Error in getMenus:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE MENU ITEM ───────────────────────────────────────────────────────
// GET /api/menu/:id
const getMenu = async (req, res) => {
  try {
    const menu = getMenuById(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }
    res.json({ success: true, data: menu });
  } catch (error) {
    console.error('Error in getMenu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE MENU ITEM ───────────────────────────────────────────────────────────
// POST /api/menu
const createMenu = async (req, res) => {
  try {
    const { menuId, itemName, price, restaurantId } = req.body;

    if (!menuId || !itemName || price === undefined || !restaurantId) {
      return res.status(400).json({ success: false, message: 'menuId, itemName, price, and restaurantId are required' });
    }

    // Verify restaurant exists
    const restaurant = getRestaurantById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: `Restaurant '${restaurantId}' not found` });
    }

    // Check if menu item already exists
    if (getMenuById(menuId)) {
      return res.status(409).json({ success: false, message: `Menu item with id '${menuId}' already exists` });
    }

    const newMenu = addMenu({
      menuId,
      itemName,
      price,
      restaurantId,
      description: req.body.description || '',
      category: req.body.category || 'Others',
      isVeg: req.body.isVeg || false,
      isAvailable: req.body.isAvailable !== false,
      imageUrl: req.body.imageUrl || ''
    });

    if (!newMenu) {
      return res.status(500).json({ success: false, message: 'Failed to create menu item' });
    }

    res.status(201).json({ success: true, data: newMenu });
  } catch (error) {
    console.error('Error in createMenu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE MENU ITEM ───────────────────────────────────────────────────────────
// PUT /api/menu/:id
const updateMenu = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.menuId; // prevent id change

    const updated = dbUpdateMenu(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateMenu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE MENU ITEM ───────────────────────────────────────────────────────────
// DELETE /api/menu/:id
const deleteMenu = async (req, res) => {
  try {
    const menu = getMenuById(req.params.id);
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    const db = require('../utils/dbManager').readDB();
    db.menus = db.menus.filter(m => String(m.menuId) !== String(req.params.id) && String(m.id) !== String(req.params.id));
    require('../utils/dbManager').writeDB(db);

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error in deleteMenu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMenus, getMenu, createMenu, updateMenu, deleteMenu };
