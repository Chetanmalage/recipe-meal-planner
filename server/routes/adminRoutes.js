const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, getAllRecipes, deleteAnyRecipe } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.route('/recipes').get(protect, admin, getAllRecipes);
router.route('/recipes/:id').delete(protect, admin, deleteAnyRecipe);

module.exports = router;