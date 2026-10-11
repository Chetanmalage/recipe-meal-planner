const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required() { return !this.googleId; }, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    mealPlan: { type: Map, of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }], default: {} },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
