// cartRoutes.js
const express = require('express');
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  getCart,
  getCartByUser,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart
} = require('../controllers/cartController');

// Customer: get own cart by userId
router.get('/user/:userId', auth, getCartByUser);

// Get cart by cart ID
router.get('/:id', auth, getCart);

// Customer-only cart mutations
router.post('/add-item', auth, roleAuth(['Customer']), addItemToCart);
router.put('/update-quantity', auth, roleAuth(['Customer']), updateItemQuantity);
router.post('/remove-item', auth, roleAuth(['Customer']), removeItemFromCart);

module.exports = router;