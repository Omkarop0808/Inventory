const express = require('express');
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// POST create checkout session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Mezenga Pro Plan',
              description: 'Unlimited properties, rooms, and advanced analytics.',
            },
            unit_amount: 99900, // Amount in paise (₹999.00)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5173/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/dashboard?upgrade=cancelled`,
      client_reference_id: req.user._id.toString(),
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Could not create checkout session' });
  }
});

// POST verify and upgrade success
router.post('/upgrade-success', requireAuth, async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'Session ID required' });

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status === 'paid' && session.client_reference_id === req.user._id.toString()) {
      // Update user plan
      const user = await User.findById(req.user._id);
      user.plan = 'paid';
      await user.save();

      return res.json({ success: true, message: 'Successfully upgraded to Pro' });
    }

    res.status(400).json({ error: 'Payment not verified' });
  } catch (error) {
    console.error('Stripe verify error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
