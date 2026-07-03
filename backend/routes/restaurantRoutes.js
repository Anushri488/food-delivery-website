const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  uploadRestaurantImage
} = require('../controllers/restaurantController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Admin-only routes
router.post('/', protect, adminOnly, createRestaurant);
router.put('/:id', protect, adminOnly, updateRestaurant);
router.delete('/:id', protect, adminOnly, deleteRestaurant);
router.post('/:id/upload-image', protect, adminOnly, upload.single('image'), uploadRestaurantImage);

module.exports = router;