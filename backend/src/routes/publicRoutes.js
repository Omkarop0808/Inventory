const express = require('express');
const Property = require('../models/Property');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const router = express.Router();

// GET public property by slug
router.get('/property/:slug', async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { publicSlug: req.params.slug },
      { $inc: { pageViews: 1 } },
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST check availability
router.post('/availability', async (req, res) => {
  try {
    const { slug, checkin, checkout } = req.body;
    if (!slug || !checkin || !checkout) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const property = await Property.findOne({ publicSlug: slug });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const rooms = await Room.find({ propertyId: property._id });

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    const availability = [];

    for (const room of rooms) {
      // Find bookings for this room that overlap with the requested dates
      // Overlap condition: (booking.checkin < requested.checkout) AND (booking.checkout > requested.checkin)
      const overlappingBookings = await Booking.find({
        roomId: room._id,
        checkinDate: { $lt: checkoutDate },
        checkoutDate: { $gt: checkinDate }
      });

      const bookedCount = overlappingBookings.length;
      const availableCount = Math.max(0, room.noOfRooms - bookedCount);

      availability.push({
        room,
        availableCount
      });
    }

    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
