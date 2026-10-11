const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { toggleFavourite, getFavourites, updateMealPlan, getMealPlan } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { mongoIdValidator } = require('../middleware/validators');

const validateMealPlan = [
  body('day').isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']).withMessage('Invalid day'),
  body('recipeId').isMongoId().withMessage('Invalid recipe ID'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: errors.array()[0].msg });
    next();
  },
];

router.get('/favourites', protect, getFavourites);
router.put('/favourites/:id', protect, mongoIdValidator, toggleFavourite);
router.get('/mealplan', protect, getMealPlan);
router.put('/mealplan', protect, validateMealPlan, updateMealPlan);

module.exports = router;
