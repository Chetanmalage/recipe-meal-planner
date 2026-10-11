const { body, param, query, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const registerValidator = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const recipeValidator = [
  body('title').trim().isLength({ min: 3, max: 120 }).withMessage('Title must be 3-120 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('ingredients').isArray({ min: 1 }).withMessage('At least one ingredient is required'),
  body('steps').isArray({ min: 1 }).withMessage('At least one step is required'),
  body('category').isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack']).withMessage('Invalid category'),
  body('prepTime').optional().isInt({ min: 0, max: 1440 }),
  body('cookTime').optional().isInt({ min: 0, max: 1440 }),
  body('servings').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
];

const mongoIdValidator = [
  param('id').isMongoId().withMessage('Invalid ID'),
  handleValidation,
];

module.exports = {
  registerValidator,
  loginValidator,
  recipeValidator,
  mongoIdValidator,
};