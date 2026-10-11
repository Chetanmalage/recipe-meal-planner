const User = require('../models/User');
const Recipe = require('../models/Recipe');

const getUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
};

const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete an admin' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const getAllRecipes = async (req, res) => {
  const recipes = await Recipe.find({}).populate('author', 'name');
  res.json(recipes);
};

const deleteAnyRecipe = async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (recipe) {
    await recipe.deleteOne();
    res.json({ message: 'Recipe removed' });
  } else {
    res.status(404).json({ message: 'Recipe not found' });
  }
};

module.exports = { getUsers, deleteUser, getAllRecipes, deleteAnyRecipe };