////paymentRoutes.js
const express = require('express');
const router  = express.Router();
const { auth, roleAuth } = require('../middleware/auth');
const { processPayment } = require('../controllers/paymentController');

// Protected — Customer only (prevents unauthenticated order confirmation)
router.post('/pay', auth, roleAuth(['Customer']), processPayment);

module.exports = router;