const User = require('../models/User');
const Recipe = require('../models/Recipe');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort('name');
    res.json({ success: true, users });
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete an admin' });
    await Promise.all([Recipe.deleteMany({ author: user._id }), user.deleteOne()]);
    res.json({ success: true, message: 'User and their recipes removed' });
  } catch (error) { next(error); }
};

const getAllRecipes = async (req, res, next) => {
  try {
    const recipes = await Recipe.find({}).populate('author', 'name').sort('-createdAt');
    res.json({ success: true, recipes });
  } catch (error) { next(error); }
};

const deleteAnyRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    await recipe.deleteOne();
    res.json({ success: true, message: 'Recipe removed' });
  } catch (error) { next(error); }
};

module.exports = { getUsers, deleteUser, getAllRecipes, deleteAnyRecipe };
