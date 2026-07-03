const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
// JWT token generate karne ka helper function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc  Register new user
// @route POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Sab fields bharo' });
    }

    // Check karo user pehle se to nahi hai
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Ye email pehle se registered hai' });
    }

    // Naya user banao
    const user = await User.create({ name, email, password, phone });

    // Token generate karo
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Login user
// @route POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email aur password dono do' });
    }

    // Password field ko explicitly select karo (kyunki model mein select:false hai)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Galat email ya password' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Galat email ya password' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc  Get logged-in user's profile
// @route GET /api/auth/profile
exports.getProfile = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
// @desc  Update logged-in user's profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User nahi mila' });
    }

    // Sirf jo fields bheji gayi hain unhe update karo
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile update ho gaya',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc  Forgot password - OTP bhejo email pe
// @route POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Is email se koi account nahi mila' });
    }

    // 6-digit OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minute valid
    await user.save();

    const html = `
      <h2>Password Reset OTP</h2>
      <p>Aapka OTP hai: <b>${otp}</b></p>
      <p>Ye OTP 10 minute mein expire ho jaayega.</p>
    `;

    await sendEmail(user.email, 'Password Reset OTP', html);

    res.status(200).json({ success: true, message: 'OTP aapki email pe bhej diya gaya hai' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reset password using OTP
// @route POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP galat hai ya expire ho gaya' });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset ho gaya, ab login karo' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};