require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email || !process.env.MONGO_URI) throw new Error('Set ADMIN_EMAIL and MONGO_URI before running this command.');
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) throw new Error(`No account was found for ${email}. Register that account first.`);
  user.role = 'admin';
  await user.save();
  console.log(`Admin access enabled for ${email}.`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
