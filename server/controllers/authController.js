const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

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

// @desc Verify Google's signed ID token and issue the application's own session token
const googleLogin = async (req, res, next) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(503).json({ success: false, message: 'Google sign-in is not configured yet.' });
  }

  const { credential } = req.body || {};
  if (typeof credential !== 'string' || credential.length < 100 || credential.length > 8192) {
    return res.status(400).json({ success: false, message: 'A valid Google sign-in credential is required.' });
  }

  let payload;
  try {
    const ticket = await new OAuth2Client(clientId).verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ success: false, message: 'Google could not verify this sign-in. Please try again.' });
  }

  const googleId = payload?.sub;
  const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!googleId || !email.includes('@') || payload.email_verified !== true) {
    return res.status(401).json({ success: false, message: 'Google must verify the email address before sign-in.' });
  }

  try {
    let user = await User.findOne({ googleId });
    if (!user) {
      const existing = await User.findOne({ email }).select('+googleId');
      if (existing) {
        const emailDomain = email.split('@').pop();
        const googleIsAuthoritative = emailDomain === 'gmail.com'
          || (typeof payload.hd === 'string' && payload.hd.toLowerCase() === emailDomain);
        if (existing.googleId && existing.googleId !== googleId) {
          return res.status(409).json({ success: false, message: 'This email is already connected to a different Google account.' });
        }
        if (!googleIsAuthoritative) {
          return res.status(409).json({ success: false, message: 'An account already uses this email. Please sign in with your email and password.' });
        }
        existing.googleId = googleId;
        await existing.save();
        user = existing;
      } else {
        const displayName = typeof payload.name === 'string' && payload.name.trim()
          ? payload.name.trim().slice(0, 50)
          : email.split('@')[0].slice(0, 50) || 'Home cook';
        user = await User.create({ name: displayName, email, googleId });
      }
    }

    return res.json({ success: true, ...sanitizeUser(user), token: generateToken(user._id) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account already uses this Google sign-in. Please log in and try again.' });
    }
    return next(err);
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

module.exports = { registerUser, loginUser, googleLogin, getMe };
