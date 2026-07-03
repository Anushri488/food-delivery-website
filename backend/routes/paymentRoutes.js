const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment, refundPayment } = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.post('/refund', protect, adminOnly, refundPayment);

module.exports = router;