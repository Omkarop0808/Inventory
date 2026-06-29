const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Property = require('../models/Property');
const Room = require('../models/Room');
const { z } = require('zod');
const validate = require('../middleware/validate');
const slugify = require('slugify');
const { nanoid } = require('nanoid');

const router = express.Router();

const propertySchema = z.object({
  body: z.object({
    propertyName: z.string().min(1),
    contactNumber: z.string().min(10),
    whatsappNumber: z.string().min(10),
    state: z.string().min(1),
    region: z.string().min(1),
    address: z.string().min(1),
    emailId: z.string().email(),
    backgroundImageUrl: z.string().optional(),
  })
});

// GET all properties for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const properties = await Property.find({ ownerId: req.user._id });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST create property
router.post('/', requireAuth, validate(propertySchema), async (req, res) => {
  try {
    // Check free plan limits (max 1 property)
    if (req.user.plan === 'free') {
      const propertyCount = await Property.countDocuments({ ownerId: req.user._id });
      if (propertyCount >= 1) {
        return res.status(403).json({ error: 'Free plan limit reached: Max 1 property allowed.' });
      }
    }

    const { propertyName, contactNumber, whatsappNumber, state, region, address, emailId, backgroundImageUrl } = req.body;
    
    const publicSlug = `${slugify(propertyName, { lower: true, strict: true })}-${nanoid(4)}`;

    const property = await Property.create({
      ownerId: req.user._id,
      propertyName,
      contactNumber,
      whatsappNumber,
      state,
      region,
      address,
      emailId,
      backgroundImageUrl,
      publicSlug
    });

    res.status(201).json(property);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH update property
router.patch('/:id', requireAuth, validate(propertySchema), async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user._id },
      req.body,
      { new: true }
    );
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE property
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ _id: req.params.id, ownerId: req.user._id });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    // Also delete associated rooms and bookings
    await Room.deleteMany({ propertyId: req.params.id });
    // Note: Assuming bookings will also be deleted if rooms are deleted, or explicitly deleted here.
    const mongoose = require('mongoose');
    await mongoose.model('Booking').deleteMany({ propertyId: req.params.id });
    
    res.json({ message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
