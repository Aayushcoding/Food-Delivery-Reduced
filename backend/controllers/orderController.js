////orderController.js
const db = require('../utils/dbManager');

// CREATE ORDER
const createOrder = async(req, res) => {
  try {
    const { userId, deliveryAddress } = req.body;

    if (!userId || userId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: `User '${userId}' not found` });
    }

    let resolvedAddress = deliveryAddress;
    if (!resolvedAddress) {
      const addr = user.address;
      if (Array.isArray(addr) && addr.length > 0) {
        resolvedAddress = `${addr[0].street || ''}, ${addr[0].city || ''}`.trim().replace(/^,\s*|,\s*$/g, '');
      } else {
        resolvedAddress = 'Address not provided';
      }
    }

    const cart = await db.getCartByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty. Add items before placing an order.' });
    }

    const enrichedItems = [];
    for (const cartItem of cart.items) {
      const menuItem = await db.getMenuItem(cartItem.itemId);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Item '${cartItem.name || cartItem.itemId}' no longer exists in the menu` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `'${menuItem.itemName}' is currently unavailable` });
      }
      enrichedItems.push({
        itemId:       cartItem.itemId,
        name:         menuItem.itemName,
        price:        menuItem.price,
        quantity:     cartItem.quantity,
        restaurantId: cartItem.restaurantId || menuItem.restaurantId
      });
    }

    const totalAmount = enrichedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const order = await db.createOrder({
      userId,
      restaurantId:    cart.restaurantId,
      items:           enrichedItems,
      totalAmount,
      deliveryAddress: resolvedAddress,
      status:          'pending'
    });

    await db.deleteCart(cart.id);

    return res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch(error) {
    console.error('[createOrder] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error. Please try again later.' });
  }
};

// GET ORDERS FOR USER
const getUserOrders = async(req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const user = await db.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: `User '${userId}' not found` });
    }

    const orders = await db.getOrdersByUserId(userId);
    return res.status(200).json({ success: true, data: orders });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET SINGLE ORDER
const getOrderById = async(req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Order ID is required' });

    const order = await db.getOrder(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.status(200).json({ success: true, data: order });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET ALL ORDERS
const getAllOrders = async(req, res) => {
  try {
    const orders = await db.getAllOrders();
    return res.status(200).json({ success: true, data: orders });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// GET ORDERS BY RESTAURANT
const getOrdersByRestaurant = async(req, res) => {
  try {
    const { restaurantId } = req.params;
    if (!restaurantId) return res.status(400).json({ success: false, message: 'restaurantId is required' });

    const restaurant = await db.getRestaurant(restaurantId);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const orders = await db.getOrdersByRestaurantId(restaurantId);
    return res.status(200).json({ success: true, data: orders });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// UPDATE ORDER STATUS
const updateOrderStatus = async(req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) return res.status(400).json({ success: false, message: 'Order ID is required' });
    if (!status || status.trim().length === 0) return res.status(400).json({ success: false, message: 'Status is required' });

    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const order = await db.updateOrder(id, { status });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    return res.status(200).json({ success: true, message: 'Order status updated', data: order });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

// CANCEL ORDER — only within 5 minutes of creation, only if still pending
const cancelOrder = async(req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'Order ID is required' });

    const order = await db.getOrder(id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}. Only pending orders can be cancelled.`
      });
    }

    // Only allow cancellation within 5 minutes of placing the order
    const orderTime = new Date(order.createdAt);
    const diffInMinutes = (Date.now() - orderTime.getTime()) / (1000 * 60);
    if (diffInMinutes > 5) {
      return res.status(400).json({
        success: false,
        message: 'You can only cancel an order within 5 minutes of placing it.'
      });
    }

    const updated = await db.updateOrder(id, { status: 'cancelled' });
    return res.status(200).json({ success: true, message: 'Order cancelled successfully', data: updated });
  } catch(error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


module.exports = { createOrder, getUserOrders, getOrderById, getAllOrders, getOrdersByRestaurant, updateOrderStatus, cancelOrder };