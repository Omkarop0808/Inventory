const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String }, // For local email/password auth
  uid: { type: String }, // For Firebase/Google Auth users
  photoURL: { type: String, default: '' },
  plan: { type: String, enum: ['free', 'paid'], default: 'free' },
  planExpiresAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
