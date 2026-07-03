const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');

dotenv.config();

// Purani restaurants.js file yahan import karo
const restaurantsData = require('../food-delivery/data/restaurants.js');

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding...');

    // Purana data clear karo (agar test wala restaurant already dala tha)
    await Restaurant.deleteMany();
    console.log('Old restaurants deleted');

    // Naya data insert karo
    await Restaurant.insertMany(restaurantsData);
    console.log('✅ All restaurants imported successfully!');

    process.exit();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

importData();