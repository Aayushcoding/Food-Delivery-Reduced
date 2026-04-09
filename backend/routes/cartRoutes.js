const express = require('express');
const router = express.Router();
// Auth middleware DISABLED FOR NOW
// const { auth, roleAuth } = require('../middleware/auth');
const {
  getCarts,
  getCart,
  getCartByUser,
  createCart,
  updateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  deleteCart
} = require('../controllers/cartController');

// Specific routes before parameter routes
// Auth middleware DISABLED FOR NOW - all APIs are public
// router.get('/user/:userId', auth, roleAuth(['Customer']), getCartByUser);
router.get('/user/:userId', getCartByUser);

// Cart-specific operations (POST must come before GET /:id to avoid conflicts)
// Auth middleware DISABLED FOR NOW - all APIs are public
// router.post('/add-item', auth, roleAuth(['Customer']), addItemToCart);
router.post('/add-item', addItemToCart);

// Auth middleware DISABLED FOR NOW - all APIs are public
// router.put('/update-quantity', auth, roleAuth(['Customer']), updateItemQuantity);
router.put('/update-quantity', updateItemQuantity);

// Auth middleware DISABLED FOR NOW - all APIs are public
// router.post('/remove-item', auth, roleAuth(['Customer']), removeItemFromCart);
router.post('/remove-item', removeItemFromCart);

// General routes
// Auth middleware DISABLED FOR NOW - all APIs are public
// router.get('/', auth, roleAuth(['Customer']), getCarts);
router.get('/', getCarts);

// Auth middleware DISABLED FOR NOW - all APIs are public
// router.get('/:id', auth, roleAuth(['Customer']), getCart);
router.get('/:id', getCart);

// Auth middleware DISABLED FOR NOW - all APIs are public
// router.post('/', auth, roleAuth(['Customer']), createCart);
router.post('/', createCart);

// Auth middleware DISABLED FOR NOW - all APIs are public
// router.put('/:id', auth, roleAuth(['Customer']), updateCart);
router.put('/:id', updateCart);

// TODO: Add auth middleware here after JWT implementation
// router.delete('/:id', auth, roleAuth(['Customer']), deleteCart);
router.delete('/:id', deleteCart);

module.exports = router;