const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const generateInvoice = require('../utils/generateInvoice');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
// @desc  Place a new order
// @route POST /api/orders
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryAddress, phone } = req.body;

    if (!restaurantId || !items || items.length === 0 || !deliveryAddress || !phone) {
      return res.status(400).json({ success: false, message: 'Sab fields bharo' });
    }

    // Restaurant dhoondo
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    }

    // Har item ka price restaurant ke menu se verify karo (security ke liye — client se aaye price pe bharosa mat karo)
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = restaurant.menu.id(item.menuItemId);
      if (!menuItem) {
        return res.status(400).json({ success: false, message: `Menu item nahi mila: ${item.menuItemId}` });
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

    // Order confirmation email bhejo (agar fail bhi ho jaaye, order place hona nahi rukna chahiye)
    // Pehle response bhej do — user ko turant confirmation mile, wait na karna pade
    res.status(201).json({ success: true, message: 'Order place ho gaya', order });

    // Email background mein bhejo (response ke baad — agar fail ho, order pe koi asar nahi)
    try {
      const itemsListHtml = orderItems
        .map(item => `<li>${item.name} × ${item.quantity} — Rs. ${item.price * item.quantity}</li>`)
        .join('');

      const html = `
        <h2>Order Confirmed! 🎉</h2>
        <p>Aapka order <b>${restaurant.name}</b> se successfully place ho gaya hai.</p>
        <ul>${itemsListHtml}</ul>
        <p><b>Total Amount:</b> Rs. ${totalAmount}</p>
        <p><b>Delivery Address:</b> ${deliveryAddress}</p>
        <p>Order ID: ${order._id}</p>
        <p>Dhanyavaad! 🙏</p>
      `;

      await sendEmail(req.user.email, 'Order Confirmation - Food Delivery', html);
    } catch (emailError) {
      console.log('Email bhejne mein error:', emailError.message);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get logged-in user's order history
// @route GET /api/orders/my-orders
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

// @desc  Get single order by ID
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('restaurant', 'name image');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order nahi mila' });
    }

    // Sirf apna order dekh sake (ya admin)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Ye order dekhne ki permission nahi hai' });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc  Update order status (admin only)
// @route PUT /api/orders/:id/status
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
      return res.status(404).json({ success: false, message: 'Order nahi mila' });
    }

    // Real-time update bhejo us order ke room mein
    // Real-time update bhejo us order ke room mein
    const io = req.app.get('io');
    io.to(order._id.toString()).emit('orderStatusUpdated', {
      orderId: order._id,
      status: order.status
    });

    // Pehle response bhej do — turant reply mile
    res.status(200).json({ success: true, message: 'Order status update ho gaya', order });

    // Email background mein bhejo
    try {
      const user = await User.findById(order.user);
      if (user) {
        const html = `
          <h2>Order Status Update 🔔</h2>
          <p>Aapke order (ID: ${order._id}) ka status update hua hai:</p>
          <h3>${order.status}</h3>
          <p>Dhanyavaad!</p>
        `;
        await sendEmail(user.email, `Order ${order.status} - Food Delivery`, html);
      }
    } catch (emailError) {
      console.log('Status email bhejne mein error:', emailError.message);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc  Get all orders (admin only)
// @route GET /api/orders
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


// @desc  Download invoice PDF for an order
// @route GET /api/orders/:id/invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order nahi mila' });
    }

    // Sirf apna order ya admin dekh sake
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission nahi hai' });
    }

    generateInvoice(order, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};