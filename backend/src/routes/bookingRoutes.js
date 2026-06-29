const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Property = require('../models/Property');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { addDays, parseISO } = require('date-fns');

const router = express.Router();

const bookingSchema = z.object({
  body: z.object({
    roomId: z.string(),
    checkinDate: z.string(),
    noOfNights: z.number().min(1),
    guestName: z.string().min(1),
    guestEmail: z.string().email().optional().or(z.literal('')),
    guestPhone: z.string().optional().or(z.literal('')),
    noOfGuests: z.number().min(1),
    specialRequests: z.string().optional(),
  })
});

// GET bookings by propertyId
router.get('/', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: 'propertyId query param required' });

    const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const bookings = await Booking.find({ propertyId }).populate('roomId', 'roomName').sort({ checkinDate: 1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create booking
router.post('/', requireAuth, validate(bookingSchema), async (req, res) => {
  try {
    const { roomId, checkinDate, noOfNights, guestName, guestEmail, guestPhone, noOfGuests, specialRequests } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const property = await Property.findOne({ _id: room.propertyId, ownerId: req.user._id });
    if (!property) return res.status(403).json({ error: 'Unauthorized' });

    const checkin = new Date(checkinDate);
    const checkoutDate = addDays(checkin, noOfNights);

    const booking = await Booking.create({
      roomId,
      propertyId: property._id,
      checkinDate: checkin,
      noOfNights,
      checkoutDate,
      guestName,
      guestEmail,
      guestPhone,
      noOfGuests,
      specialRequests
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE booking
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const property = await Property.findOne({ _id: booking.propertyId, ownerId: req.user._id });
    if (!property) return res.status(403).json({ error: 'Unauthorized' });

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
