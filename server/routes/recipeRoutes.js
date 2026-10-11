const express = require('express');
const router = express.Router();
const {
  getRecipes, getMyRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const { recipeValidator, mongoIdValidator } = require('../middleware/validators');
const { upload } = require('../config/cloudinary');

// Parse JSON arrays if sent as strings (from multipart form-data)
const parseArrays = (req, res, next) => {
  if (typeof req.body.ingredients === 'string') {
    try { req.body.ingredients = JSON.parse(req.body.ingredients); } catch { req.body.ingredients = req.body.ingredients.split('\n').filter(Boolean); }
  }
  if (typeof req.body.steps === 'string') {
    try { req.body.steps = JSON.parse(req.body.steps); } catch { req.body.steps = req.body.steps.split('\n').filter(Boolean); }
  }
  next();
};

router.route('/')
  .get(getRecipes)
  .post(protect, upload.single('image'), parseArrays, recipeValidator, createRecipe);

router.get('/myrecipes', protect, getMyRecipes);

router.route('/:id')
  .get(mongoIdValidator, getRecipeById)
  .put(protect, mongoIdValidator, upload.single('image'), parseArrays, updateRecipe)
  .delete(protect, mongoIdValidator, deleteRecipe);

module.exports = router;