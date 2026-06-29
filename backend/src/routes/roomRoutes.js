const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Room = require('../models/Room');
const Property = require('../models/Property');
const { z } = require('zod');
const validate = require('../middleware/validate');

const router = express.Router();

const roomSchema = z.object({
  body: z.object({
    propertyId: z.string(),
    roomName: z.string().min(1),
    noOfRooms: z.number().min(1),
    priceRoomOnly: z.number().min(0),
    priceBreakfast: z.number().min(0),
    priceBreakfastDinner: z.number().min(0),
    priceAllMeals: z.number().min(0),
  })
});

// GET rooms by propertyId
router.get('/', requireAuth, async (req, res) => {
  try {
    const { propertyId } = req.query;
    if (!propertyId) return res.status(400).json({ error: 'propertyId query param required' });

    // Verify ownership
    const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const rooms = await Room.find({ propertyId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create room
router.post('/', requireAuth, validate(roomSchema), async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    // Verify ownership
    const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Check free plan limits (max 4 rooms total per property)
    if (req.user.plan === 'free') {
      const roomCount = await Room.countDocuments({ propertyId });
      if (roomCount >= 4) {
        return res.status(403).json({ error: 'Free plan limit reached: Max 4 rooms allowed.' });
      }
    }

    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update room
router.patch('/:id', requireAuth, validate(roomSchema), async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findOne({ _id: propertyId, ownerId: req.user._id });
    if (!property) return res.status(403).json({ error: 'Unauthorized to modify this room' });

    const room = await Room.findOneAndUpdate({ _id: req.params.id, propertyId }, req.body, { new: true });
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE room
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const property = await Property.findOne({ _id: room.propertyId, ownerId: req.user._id });
    if (!property) return res.status(403).json({ error: 'Unauthorized' });

    await Room.findByIdAndDelete(req.params.id);
    // Also delete bookings for this room
    const mongoose = require('mongoose');
    await mongoose.model('Booking').deleteMany({ roomId: req.params.id });

    res.json({ message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
