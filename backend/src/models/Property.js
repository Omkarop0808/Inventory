const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  whatsappNumber: { type: String, required: true },
  state: { type: String, required: true },
  region: { type: String, required: true },
  address: { type: String, required: true },
  emailId: { type: String, required: true },
  publicSlug: { type: String, required: true, unique: true },
  pageViews: { type: Number, default: 0 },
  backgroundImageUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
