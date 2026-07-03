const Restaurant = require('../models/Restaurant');

// @desc  Create new restaurant
// @route POST /api/restaurants
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all restaurants
// @route GET /api/restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true });
    res.status(200).json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single restaurant by ID
// @route GET /api/restaurants/:id
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    }
    res.status(200).json({ success: true, restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update restaurant
// @route PUT /api/restaurants/:id
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    }
    res.status(200).json({ success: true, message: 'Restaurant update ho gaya', restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete restaurant
// @route DELETE /api/restaurants/:id
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    }
    res.status(200).json({ success: true, message: 'Restaurant delete ho gaya' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc  Upload restaurant image
// @route POST /api/restaurants/:id/upload-image
exports.uploadRestaurantImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Koi image nahi mili' });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { image: req.file.path },
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant nahi mila' });
    }

    res.status(200).json({
      success: true,
      message: 'Image upload ho gayi',
      imageUrl: req.file.path,
      restaurant
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};