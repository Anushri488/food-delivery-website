const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const crypto = require('crypto');

// @desc  Create Razorpay order (payment shuru karne ke liye)
// @route POST /api/payments/create-order
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order nahi mila' });
    }

    // Sirf apna order pay kar sake
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Ye order pay karne ki permission nahi hai' });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100), // paise mein convert karo (Razorpay paise mein leta hai)
      currency: 'INR',
      receipt: `receipt_${order._id}`
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify payment after user pays (security-critical step)
// @route POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Signature verify karo — ye confirm karta hai payment genuine hai, fake nahi
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification fail ho gayi' });
    }

    // Verification successful — order ko "Paid" mark karo
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'Paid' },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Payment verified aur successful', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc  Refund a payment (admin only)
// @route POST /api/payments/refund
exports.refundPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order nahi mila' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'Ye order paid nahi hai, refund nahi ho sakta' });
    }

    // Razorpay ke through refund initiate karo
    const refund = await razorpayInstance.payments.refund(razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100), // poora amount, paise mein
      notes: {
        reason: reason || 'Customer requested refund',
        orderId: order._id.toString()
      }
    });

    // Order ka status update karo
    order.paymentStatus = 'Refunded';
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund initiate ho gaya',
      refund,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};