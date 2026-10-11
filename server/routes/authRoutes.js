const express = require('express');
const router = express.Router();
const { registerUser, loginUser, googleLogin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidator, loginValidator, googleLoginValidator } = require('../middleware/validators');

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/google', googleLoginValidator, googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
