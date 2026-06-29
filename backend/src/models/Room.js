const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  roomName: { type: String, required: true },
  noOfRooms: { type: Number, required: true },
  priceRoomOnly: { type: Number, required: true },
  priceBreakfast: { type: Number, required: true },
  priceBreakfastDinner: { type: Number, required: true },
  priceAllMeals: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
