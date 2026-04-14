/////restaurantController.js
const db = require('../utils/dbManager');

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=300&fit=crop';

// GET /api/restaurants
const getAllRestaurants = async(req, res) => {
  try {
    const { search } = req.query;
    let restaurants = await db.getAllRestaurants();

    restaurants = restaurants.map(r => ({
      ...r,
      displayImage: r.displayImage || DEFAULT_IMAGE,
      imageUrl: r.displayImage || r.imageUrl || DEFAULT_IMAGE
    }));

    if (search) {
      restaurants = restaurants.filter(r =>
        r.restaurantName.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, data: restaurants });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/restaurants/:id
const getRestaurantById = async(req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const restaurant = await db.getRestaurant(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    restaurant.displayImage = restaurant.displayImage || DEFAULT_IMAGE;
    restaurant.imageUrl = restaurant.displayImage;

    res.json({ success: true, data: restaurant });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/restaurants/:id/menu
const getRestaurantMenu = async(req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const restaurant = await db.getRestaurant(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const menuItems = (await db.getMenuByRestaurant(id)).filter(item => item.isAvailable);
    res.json({ success: true, data: menuItems });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/restaurants/owner/:ownerId
const getRestaurantByOwner = async(req, res) => {
  try {
    const { ownerId } = req.params;
    if (!ownerId || ownerId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'ownerId is required' });
    }

    const owner = await db.getUser(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: `User '${ownerId}' not found` });
    }

    const restaurants = (await db.getRestaurantByOwnerId(ownerId)).map(r => ({
      ...r,
      displayImage: r.displayImage || DEFAULT_IMAGE,
      imageUrl: r.displayImage || DEFAULT_IMAGE
    }));

    res.json({ success: true, data: restaurants });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/restaurants
const createRestaurant = async(req, res) => {
  try {
    const { restaurantName, ownerId, restaurantContactNo, address, email, cuisine, gstinNo, displayImage } = req.body;

    if (!restaurantName || restaurantName.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'restaurantName is required' });
    }
    if (!ownerId || ownerId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'ownerId is required' });
    }

    const owner = await db.getUser(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: `Owner '${ownerId}' not found` });
    }

    const restaurant = await db.createRestaurant({
      restaurantName: restaurantName.trim(),
      ownerId,
      restaurantContactNo,
      address,
      email,
      cuisine,
      gstinNo,
      displayImage: displayImage || ''
    });

    res.status(201).json({ success: true, data: restaurant });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/restaurants/:id
const updateRestaurant = async(req, res) => {
  try {
    const { id } = req.params;
    const { restaurantName, address, restaurantContactNo, cuisine, isVeg, rating, displayImage } = req.body;

    if (!id || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    if (restaurantName !== undefined && !restaurantName.trim()) {
      return res.status(400).json({ success: false, message: 'restaurantName cannot be empty.' });
    }

    const existing = await db.getRestaurant(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (req.user.id !== existing.ownerId) {
      return res.status(403).json({ success: false, message: 'You are not the owner of this restaurant.' });
    }

    const restaurant = await db.updateRestaurant(id, {
      restaurantName: (restaurantName && restaurantName.trim()) || existing.restaurantName,
      address:             address !== undefined ? address : existing.address,
      restaurantContactNo: restaurantContactNo !== undefined ? restaurantContactNo : existing.restaurantContactNo,
      cuisine:             cuisine !== undefined ? cuisine : existing.cuisine,
      isVeg:               isVeg !== undefined ? isVeg : existing.isVeg,
      rating:              rating !== undefined ? rating : existing.rating,
      displayImage:        displayImage !== undefined ? displayImage : existing.displayImage
    });

    res.json({ success: true, data: restaurant });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/restaurants/:id
const deleteRestaurant = async(req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const existing = await db.getRestaurant(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    if (req.user.id !== existing.ownerId) {
      return res.status(403).json({ success: false, message: 'You are not the owner of this restaurant.' });
    }

    await db.deleteRestaurant(id);
    res.json({ success: true, message: 'Restaurant deleted' });
  } catch(err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllRestaurants, getRestaurantById, getRestaurantMenu, getRestaurantByOwner, createRestaurant, updateRestaurant, deleteRestaurant };