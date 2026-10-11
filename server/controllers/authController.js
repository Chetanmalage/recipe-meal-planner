const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

// @desc Register
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({
      success: true,
      ...sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc Login
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({
      success: true,
      ...sanitizeUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get current user
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favourites', 'title imageUrl')
      .populate('mealPlan');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerUser, loginUser, getMe };