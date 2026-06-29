const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  checkinDate: { type: Date, required: true },
  noOfNights: { type: Number, required: true },
  checkoutDate: { type: Date, required: true },
  guestName: { type: String, required: true },
  guestEmail: { type: String },
  guestPhone: { type: String },
  noOfGuests: { type: Number, required: true },
  specialRequests: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
