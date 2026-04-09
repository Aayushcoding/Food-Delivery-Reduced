const express = require('express');
const router = express.Router();
// Auth middleware DISABLED FOR NOW
// const { auth, roleAuth } = require('../middleware/auth');
const {
  getRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

router.get('/', getRestaurants); // Public - customers can view
router.get('/:id', getRestaurant); // Public - customers can view
// Auth middleware DISABLED FOR NOW - all APIs are public
router.post('/', createRestaurant); // All users can create
// Auth middleware DISABLED FOR NOW - all APIs are public
router.put('/:id', updateRestaurant); // All users can update
// Auth middleware DISABLED FOR NOW - all APIs are public
router.delete('/:id', deleteRestaurant); // All users can delete

module.exports = router;