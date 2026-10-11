const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getAllRecipes, deleteAnyRecipe } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { mongoIdValidator } = require('../middleware/validators');

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, mongoIdValidator, deleteUser);
router.route('/recipes').get(protect, admin, getAllRecipes);
router.route('/recipes/:id').delete(protect, admin, mongoIdValidator, deleteAnyRecipe);

module.exports = router;