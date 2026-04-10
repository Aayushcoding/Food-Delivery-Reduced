// controllers/restaurantController.js
// Using db.json for data persistence (NO MongoDB)

const { getAllRestaurants, getRestaurantById, getRestaurantsByOwner, addRestaurant, updateRestaurant: dbUpdateRestaurant } = require('../utils/dbManager');

// ── GET ALL RESTAURANTS ────────────────────────────────────────────────────────
// GET /api/restaurants?isVeg=true&search=spice&page=1&limit=10&sortBy=restaurantName&order=asc
const getRestaurants = async (req, res) => {
  try {
    const { isVeg, search, ownerId, page = 1, limit = 10, sortBy = 'restaurantName', order = 'asc' } = req.query;
    
    let restaurants = getAllRestaurants();
    
    // Apply filters
    if (isVeg !== undefined) {
      restaurants = restaurants.filter(r => String(r.isVeg) === String(isVeg === 'true'));
    }
    
    if (ownerId) {
      restaurants = restaurants.filter(r => String(r.ownerId) === String(ownerId));
    }
    
    if (search) {
      const searchLower = String(search).toLowerCase();
      restaurants = restaurants.filter(r =>
        String(r.restaurantName).toLowerCase().includes(searchLower) ||
        String(r.address || '').toLowerCase().includes(searchLower) ||
        (Array.isArray(r.cuisine) ? r.cuisine.join(',').toLowerCase().includes(searchLower) : false)
      );
    }
    
    // Apply sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    restaurants.sort((a, b) => {
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
    const total = restaurants.length;
    
    const paginatedRestaurants = restaurants.slice(skip, skip + limitNum);
    
    res.json({ success: true, total, page: pageNum, limit: limitNum, data: paginatedRestaurants });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET SINGLE RESTAURANT ──────────────────────────────────────────────────────
// GET /api/restaurants/:id
const getRestaurant = async (req, res) => {
  try {
    const restaurant = getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error('Error in getRestaurant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CREATE RESTAURANT ──────────────────────────────────────────────────────────
// POST /api/restaurants
const createRestaurant = async (req, res) => {
  try {
    const { restaurantId, restaurantName, ownerId, contactNo, address, email } = req.body;
    
    if (!restaurantId || !restaurantName || !ownerId) {
      return res.status(400).json({ success: false, message: 'restaurantId, restaurantName, and ownerId are required' });
    }
    
    // Check if restaurant already exists
    if (getRestaurantById(restaurantId)) {
      return res.status(409).json({ success: false, message: `Restaurant with id '${restaurantId}' already exists` });
    }
    
    const newRestaurant = addRestaurant({
      restaurantId,
      restaurantName,
      ownerId,
      contactNo: contactNo || '',
      address: address || '',
      email: email || '',
      cuisine: req.body.cuisine || [],
      isVeg: req.body.isVeg || false,
      rating: req.body.rating || 4.5
    });
    
    if (!newRestaurant) {
      return res.status(500).json({ success: false, message: 'Failed to create restaurant' });
    }
    
    res.status(201).json({ success: true, data: newRestaurant });
  } catch (error) {
    console.error('Error in createRestaurant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── UPDATE RESTAURANT ──────────────────────────────────────────────────────────
// PUT /api/restaurants/:id
const updateRestaurant = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.restaurantId; // prevent id change
    
    const updated = dbUpdateRestaurant(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in updateRestaurant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE RESTAURANT ──────────────────────────────────────────────────────────
// DELETE /api/restaurants/:id
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = getRestaurantById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    
    // Mark as deleted or remove from array
    const db = require('../utils/dbManager').readDB();
    db.restaurants = db.restaurants.filter(r => String(r.restaurantId) !== String(req.params.id) && String(r.id) !== String(req.params.id));
    require('../utils/dbManager').writeDB(db);
    
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch (error) {
    console.error('Error in deleteRestaurant:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRestaurants, getRestaurant, createRestaurant, updateRestaurant, deleteRestaurant };
