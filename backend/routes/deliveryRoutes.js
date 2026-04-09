const express = require('express');
const router = express.Router();
// Auth middleware DISABLED FOR NOW
// const { auth, roleAuth, optionalAuth } = require('../middleware/auth');
const {
  getDeliveryAgents,
  getDeliveryAgent,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent
} = require('../controllers/deliveryController');

// Admin can view all delivery agents
// Auth middleware DISABLED FOR NOW - all APIs are public
router.get('/', getDeliveryAgents);

// Any authenticated user can view agent details
// Auth middleware DISABLED FOR NOW - all APIs are public
router.get('/:id', getDeliveryAgent);

// Admin/Owner can create delivery agents
// Auth middleware DISABLED FOR NOW - all APIs are public
router.post('/', createDeliveryAgent);

// Delivery agent or admin can update agent info
// Auth middleware DISABLED FOR NOW - all APIs are public
router.put('/:id', updateDeliveryAgent);

// Admin can delete delivery agents
// Auth middleware DISABLED FOR NOW - all APIs are public
router.delete('/:id', deleteDeliveryAgent);

module.exports = router;