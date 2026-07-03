const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check karega ki user logged in hai ya nahi (valid token hai ya nahi)
exports.protect = async (req, res, next) => {
  let token;

  // Header mein "Authorization: Bearer <token>" format mein token aata hai
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token verify karo
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko dhundo aur request object mein attach karo (password ke bina)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User nahi mila, dobara login karo' });
      }

      next(); // sab sahi hai, aage badho
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Token invalid hai ya expire ho gaya' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Login zaroori hai, token nahi mila' });
  }
};

// Check karega ki user "admin" hai ya nahi (admin-only routes ke liye)
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Sirf admin ye kaam kar sakta hai' });
  }
};