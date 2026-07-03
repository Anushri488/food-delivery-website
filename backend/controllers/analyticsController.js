const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// @desc  Overall dashboard stats (admin only)
// @route GET /api/analytics/overview
exports.getOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();

    // Sirf "Paid" orders ka revenue count karo
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Order status ka breakdown (kitne Placed, Preparing, Delivered, etc.)
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      overview: {
        totalOrders,
        totalUsers,
        totalRestaurants,
        totalRevenue,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Popular menu items (most ordered)
// @route GET /api/analytics/popular-items
exports.getPopularItems = async (req, res) => {
  try {
    const popularItems = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({ success: true, popularItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Restaurant-wise sales report
// @route GET /api/analytics/restaurant-sales
exports.getRestaurantSales = async (req, res) => {
  try {
    const salesReport = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: '$restaurant',
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'restaurants',
          localField: '_id',
          foreignField: '_id',
          as: 'restaurantInfo'
        }
      },
      { $unwind: '$restaurantInfo' },
      {
        $project: {
          restaurantName: '$restaurantInfo.name',
          totalOrders: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.status(200).json({ success: true, salesReport });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  User activity log (recent registrations + order counts)
// @route GET /api/analytics/user-activity
exports.getUserActivity = async (req, res) => {
  try {
    const userActivity = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          name: '$userInfo.name',
          email: '$userInfo.email',
          totalOrders: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);

    res.status(200).json({ success: true, userActivity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};