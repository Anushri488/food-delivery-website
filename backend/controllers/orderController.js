const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const generateInvoice = require('../utils/generateInvoice');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');

exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, phone } = req.body;

    if (!restaurantId || !items || items.length === 0 || !deliveryAddress || !phone) {
      return res.status(400).json({ success: false, message: 'Please fill in all fields' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item not found: ${item.menuItemId}` });
      }

      const quantity = item.quantity || 1;
      totalAmount += menuItem.price * quantity;

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity
      });
    }

    totalAmount += restaurant.deliveryFee;

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurantId,
      items: orderItems,
      totalAmount,
      deliveryFee: restaurant.deliveryFee,
      deliveryAddress,
      phone
    });

    res.status(201).json({ success: true, message: 'Order placed successfully', order });

    try {
      const itemsListHtml = orderItems
        .map(item => `<li>${item.name} × ${item.quantity} — Rs. ${item.price * item.quantity}</li>`)
        .join('');

      const html = `
        <h2>Order Confirmed! 🎉</h2>
        <p>Your order from <b>${restaurant.name}</b> has been placed successfully.</p>
        <ul>${itemsListHtml}</ul>
        <p><b>Total Amount:</b> Rs. ${totalAmount}</p>
        <p><b>Delivery Address:</b> ${deliveryAddress}</p>
        <p>Order ID: ${order._id}</p>
        <p>Thank you! 🙏</p>
      `;

      await sendEmail(req.user.email, 'Order Confirmation - Food Delivery', html);
    } catch (emailError) {
      console.log('Error sending email:', emailError.message);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const io = req.app.get('io');
    io.to(order._id.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status: order.status
    });

    res.status(200).json({ success: true, message: 'Order status updated successfully', order });

    try {
      const user = await User.findById(order.user);
      if (user) {
        const html = `
          <h2>Order Status Update 🔔</h2>
          <p>Your order (ID: ${order._id}) status has been updated to:</p>
          <h3>${order.status}</h3>
          <p>Thank you!</p>
        `;
        await sendEmail(user.email, `Order ${order.status} - Food Delivery`, html);
      }
    } catch (emailError) {
      console.log('Error sending status email:', emailError.message);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    generateInvoice(order, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};