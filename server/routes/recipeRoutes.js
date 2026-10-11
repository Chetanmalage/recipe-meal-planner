const express = require('express');
const router = express.Router();
const {
  getRecipes, getMyRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, addReview,
} = require('../controllers/recipeController');
const { protect } = require('../middleware/authMiddleware');
const { recipeValidator, reviewValidator, mongoIdValidator } = require('../middleware/validators');
const { upload } = require('../config/cloudinary');

const parseArrays = (req, res, next) => {
  for (const key of ['ingredients', 'steps']) {
    if (typeof req.body[key] === 'string') {
      try { req.body[key] = JSON.parse(req.body[key]); }
      catch { req.body[key] = req.body[key].split('\n').map((value) => value.trim()).filter(Boolean); }
    }
  }
  next();
};

router.route('/').get(getRecipes).post(protect, upload.single('image'), parseArrays, recipeValidator, createRecipe);
router.get('/myrecipes', protect, getMyRecipes);
router.post('/:id/reviews', protect, mongoIdValidator, reviewValidator, addReview);
router.route('/:id')
  .get(mongoIdValidator, getRecipeById)
  .put(protect, mongoIdValidator, upload.single('image'), parseArrays, recipeValidator, updateRecipe)
  .delete(protect, mongoIdValidator, deleteRecipe);

module.exports = router;
