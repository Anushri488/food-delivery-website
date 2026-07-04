const razorpayInstance = require('../config/razorpay');
const Order = require('../models/Order');
const crypto = require('crypto');

exports.createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You do not have permission to pay for this order' });
    }

    const options = {
      amount: Math.round(order.totalAmount * 100),
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

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'Paid' },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Payment verified successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refundPayment = async (req, res) => {
  try {
    const { orderId, razorpayPaymentId, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentStatus !== 'Paid') {
      return res.status(400).json({ success: false, message: 'This order is not paid, refund not possible' });
    }

    const refund = await razorpayInstance.payments.refund(razorpayPaymentId, {
      amount: Math.round(order.totalAmount * 100),
      notes: {
        reason: reason || 'Customer requested refund',
        orderId: order._id.toString()
      }
    });

    order.paymentStatus = 'Refunded';
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      refund,
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};