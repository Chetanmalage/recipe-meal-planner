const User = require('../models/User');

const toggleFavourite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const recipeId = req.params.id;

    const exists = user.favourites.some((id) => id.toString() === recipeId);
    if (exists) {
      user.favourites = user.favourites.filter((id) => id.toString() !== recipeId);
    } else {
      user.favourites.push(recipeId);
    }
    await user.save();
    res.json({ success: true, favourites: user.favourites });
  } catch (err) {
    next(err);
  }
};

const getFavourites = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favourites', 'title imageUrl category rating numReviews description');
    res.json({ success: true, recipes: user.favourites });
  } catch (err) {
    next(err);
  }
};

const updateMealPlan = async (req, res, next) => {
  try {
    const { day, recipeId } = req.body;
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (!validDays.includes(day)) {
      return res.status(400).json({ success: false, message: 'Invalid day' });
    }

    const user = await User.findById(req.user._id);
    if (!user.mealPlan) user.mealPlan = new Map();

    let dayRecipes = user.mealPlan.get(day) || [];
    const exists = dayRecipes.some((id) => id.toString() === recipeId);

    if (exists) {
      dayRecipes = dayRecipes.filter((id) => id.toString() !== recipeId);
    } else {
      dayRecipes.push(recipeId);
    }

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
    res.json({ success: true, mealPlan: user.mealPlan || {} });
  } catch (err) {
    next(err);
  }
};

module.exports = { toggleFavourite, getFavourites, updateMealPlan, getMealPlan };