const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const Property = require('../models/Property');
const User = require('../models/User');

const router = express.Router();

// GET admin stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const properties = await Property.find().populate('ownerId', 'name email plan').lean();
    const totalHomestays = properties.length;
    
    // Get all users
    const users = await User.find().lean();
    
    let freePlanCount = 0;
    let paidPlanCount = 0;
    
    users.forEach(user => {
      if (user.plan === 'paid') paidPlanCount++;
      else freePlanCount++;
    });

    const mappedProperties = properties.map(prop => ({
      _id: prop._id,
      propertyName: prop.propertyName || 'Unknown',
      ownerName: prop.ownerId?.name || 'Unknown',
      ownerEmail: prop.ownerId?.email || 'Unknown',
      ownerPlan: prop.ownerId?.plan || 'free',
      region: prop.region || 'Unknown',
      state: prop.state || 'Unknown',
      pageViews: prop.pageViews || 0,
      publicSlug: prop.publicSlug
    }));

    res.json({
      totalHomestays,
      freePlanCount,
      paidPlanCount,
      properties: mappedProperties
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
