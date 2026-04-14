///paymentController.js
const db = require('../utils/dbManager');

// POST /api/payment/pay
// Marks an order as "confirmed" (simulated payment — no real gateway)
const processPayment = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'orderId and userId are required'
      });
    }

    // await is required — db methods return Promises
    const order = await db.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden: not your order' });
    }

    if (['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be paid. Current status: ${order.status}`
      });
    }

    // await is required — db methods return Promises
    const updated = await db.updateOrder(orderId, { status: 'confirmed' });

    return res.status(200).json({
      success: true,
      message: 'Payment successful. Order confirmed!',
      data: {
        orderId:     updated.id,
        status:      updated.status,
        totalAmount: updated.totalAmount
      }
    });

  } catch (err) {
    console.error('[processPayment]', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { processPayment };