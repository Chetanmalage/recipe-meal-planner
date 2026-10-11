const Recipe = require('../models/Recipe');
const paginate = require('../utils/pagination');

// @desc Get all recipes
const getRecipes = async (req, res, next) => {
  try {
    const { keyword, category, page = 1, limit = 12 } = req.query;
    const filter = {};
    if (keyword) filter.title = { $regex: keyword, $options: 'i' };
    if (category && category !== 'All') filter.category = category;

    const result = await paginate(Recipe, req.query, {
      page, limit, filter, populate: { path: 'author', select: 'name' },
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

// @desc Get my recipes
const getMyRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id }).sort('-createdAt');
    res.json({ success: true, recipes });
  } catch (err) {
    next(err);
  }
};

// @desc Get single recipe
const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name email');
    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found' });
    }
    res.json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

// @desc Create recipe
const createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients, steps, category, prepTime, cookTime, servings } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    const recipe = await Recipe.create({
      title, description, ingredients, steps, category,
      prepTime, cookTime, servings,
      imageUrl,
      author: req.user._id,
    });
    res.status(201).json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

// @desc Update recipe
const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    if (req.file) updateData.imageUrl = req.file.path;

    const updated = await Recipe.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    res.json({ success: true, recipe: updated });
  } catch (err) {
    next(err);
  }
};

// @desc Delete recipe
const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await recipe.deleteOne();
    res.json({ success: true, message: 'Recipe removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecipes, getMyRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe };