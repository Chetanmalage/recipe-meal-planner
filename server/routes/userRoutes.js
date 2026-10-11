const express = require('express');
const router = express.Router();
const { toggleFavourite, getFavourites, updateMealPlan, getMealPlan } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/favourites').get(protect, getFavourites);
router.route('/favourites/:id').put(protect, toggleFavourite);
router.route('/mealplan').get(protect, getMealPlan).put(protect, updateMealPlan);

module.exports = router;