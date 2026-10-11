const User = require('../models/User');
const Recipe = require('../models/Recipe');

const toggleFavourite = async (req, res, next) => {
  try {
    const [user, recipe] = await Promise.all([User.findById(req.user._id), Recipe.findById(req.params.id)]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    const recipeId = req.params.id;
    const exists = user.favourites.some((id) => id.toString() === recipeId);
    user.favourites = exists
      ? user.favourites.filter((id) => id.toString() !== recipeId)
      : [...user.favourites, recipe._id];
    await user.save();
    res.json({ success: true, favourites: user.favourites });
  } catch (err) {
    next(err);
  }
};

const getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favourites',
      select: 'title imageUrl category rating numReviews description prepTime cookTime author',
      populate: { path: 'author', select: 'name' },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, recipes: user.favourites });
  } catch (err) {
    next(err);
  }
};

const updateMealPlan = async (req, res, next) => {
  try {
    const { day, recipeId } = req.body;
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) return res.status(400).json({ success: false, message: 'Invalid day' });
    const [user, recipe] = await Promise.all([User.findById(req.user._id), Recipe.findById(recipeId)]);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    let dayRecipes = user.mealPlan?.get(day) || [];
    const exists = dayRecipes.some((id) => id.toString() === recipeId);
    dayRecipes = exists ? dayRecipes.filter((id) => id.toString() !== recipeId) : [...dayRecipes, recipe._id];
    user.mealPlan.set(day, dayRecipes);
    await user.save();
    res.json({ success: true, mealPlan: user.mealPlan });
  } catch (err) {
    next(err);
  }
};

const getMealPlan = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('mealPlan');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, mealPlan: user.mealPlan || {} });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFavourite, getFavourites, updateMealPlan, getMealPlan };
