const express = require('express');
const router = express.Router();
// Auth middleware DISABLED FOR NOW
// const { auth, roleAuth } = require('../middleware/auth');
const {
  getOrders,
  getOrder,
  createOrder,
  placeOrderFromCart,
  updateOrder,
  deleteOrder
} = require('../controllers/orderController');

// Auth middleware DISABLED FOR NOW - all APIs are public
router.get('/', getOrders);

// Auth middleware DISABLED FOR NOW - all APIs are public
router.get('/:id', getOrder);

// Auth middleware DISABLED FOR NOW - all APIs are public
router.post('/', createOrder);

// Place order from cart - Customer only
// Auth middleware DISABLED FOR NOW - all APIs are public
router.post('/place', placeOrderFromCart);

// Update order - Owner only (for status updates)
// Auth middleware DISABLED FOR NOW - all APIs are public
router.put('/:id', updateOrder);

// Delete order - Owner only
// Auth middleware DISABLED FOR NOW - all APIs are public
router.delete('/:id', deleteOrder);

module.exports = router;