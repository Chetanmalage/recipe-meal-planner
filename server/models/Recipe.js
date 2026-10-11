const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true, maxlength: 500 },
}, { timestamps: true });

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  ingredients: { type: [String], required: true, validate: (values) => values.length > 0 },
  steps: { type: [String], required: true, validate: (values) => values.length > 0 },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=85' },
  category: { type: String, required: true, enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack'], default: 'Dinner' },
  prepTime: { type: Number, default: 0, min: 0, max: 1440 },
  cookTime: { type: Number, default: 0, min: 0, max: 1440 },
  servings: { type: Number, default: 2, min: 1, max: 100 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews: [reviewSchema],
  rating: { type: Number, required: true, default: 0, min: 0, max: 5 },
  numReviews: { type: Number, required: true, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Recipe', recipeSchema);
