// orderRoutes.js
const express = require("express");
const router = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const {
  getUserOrders,
  createOrder,
  getOrdersByRestaurant,
  updateOrderStatus,
  cancelOrder
} = require("../controllers/orderController");

// Customer: place order from cart
router.post("/", auth, roleAuth(['Customer']), createOrder);

// Customer: view own orders
router.get("/user/:userId", auth, getUserOrders);

// Owner: view orders for their restaurant
router.get("/restaurant/:restaurantId", auth, roleAuth(['Owner']), getOrdersByRestaurant);

// Owner: update order status
router.put("/:id/status", auth, roleAuth(['Owner']), updateOrderStatus);

// Customer: cancel their order
router.put("/:id/cancel", auth, cancelOrder);

module.exports = router;