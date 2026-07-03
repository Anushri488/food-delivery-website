const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Main Course' },
  badge: { type: String, default: '' },
  isSpicy: { type: Boolean, default: false },
  image: { type: String, default: '' }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant ka naam zaroori hai'],
    trim: true
  },
  cuisine: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  deliveryTime: {
    type: String,
    default: '30-40 min'
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ''
  },
  menu: [menuItemSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);