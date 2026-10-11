const Recipe = require('../models/Recipe');
const paginate = require('../utils/pagination');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getRecipes = async (req, res, next) => {
  try {
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : '';
    const category = typeof req.query.category === 'string' ? req.query.category : '';
    const { page = 1, limit = 12 } = req.query;
    const filter = {};
    if (keyword.trim()) {
      const pattern = new RegExp(escapeRegex(keyword.trim()), 'i');
      filter.$or = [{ title: pattern }, { description: pattern }, { ingredients: pattern }];
    }
    if (category && category !== 'All') filter.category = category;
    const result = await paginate(Recipe, req.query, {
      page, limit, filter, populate: { path: 'author', select: 'name' },
    });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

const getMyRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id }).sort('-createdAt');
    res.json({ success: true, recipes });
  } catch (err) {
    next(err);
  }
};

const getRecipeById = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name');
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

const createRecipe = async (req, res, next) => {
  try {
    const { title, description, ingredients, steps, category, prepTime, cookTime, servings } = req.body;
    const imageUrl = (req.file && (req.file.path || req.file.secure_url || (req.file.buffer && `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`))) || req.body.imageUrl || undefined;
    const recipe = await Recipe.create({
      title, description, ingredients, steps, category, prepTime, cookTime, servings, imageUrl, author: req.user._id,
    });
    res.status(201).json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

const updateRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const allowed = ['title', 'description', 'ingredients', 'steps', 'category', 'prepTime', 'cookTime', 'servings', 'imageUrl'];
    const updateData = Object.fromEntries(allowed.filter((key) => req.body[key] !== undefined).map((key) => [key, req.body[key]]));
    if (req.file) updateData.imageUrl = req.file.path || req.file.secure_url || (req.file.buffer && `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`);
    const updated = await Recipe.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, recipe: updated });
  } catch (err) {
    next(err);
  }
};

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

const addReview = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    if (recipe.reviews.some((review) => review.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this recipe' });
    }
    recipe.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(req.body.rating), comment: req.body.comment.trim() });
    recipe.numReviews = recipe.reviews.length;
    recipe.rating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0) / recipe.numReviews;
    await recipe.save();
    res.status(201).json({ success: true, recipe });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecipes, getMyRecipes, getRecipeById, createRecipe, updateRecipe, deleteRecipe, addReview, escapeRegex };
