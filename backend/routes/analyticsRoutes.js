const express = require('express');
const router = express.Router();
const {
  getOverview,
  getPopularItems,
  getRestaurantSales,
  getUserActivity
} = require('../controllers/analyticsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/overview', protect, adminOnly, getOverview);
router.get('/popular-items', protect, adminOnly, getPopularItems);
router.get('/restaurant-sales', protect, adminOnly, getRestaurantSales);
router.get('/user-activity', protect, adminOnly, getUserActivity);

module.exports = router;