const express = require('express');
const { body, validationResult } = require('express-validator');
const SupportRequest = require('../models/SupportRequest');
const auth = require('../middleware/auth');

const router = express.Router();

// Define enums for validation to avoid magic strings
const URGENCY_LEVELS = ['low', 'medium', 'high'];
const CONTACT_METHODS = ['email', 'phone'];
const CATEGORIES = ['hardware', 'software', 'network', 'security', 'data', 'other'];

// Validation middleware
const validateRequest = [
  body('category').isIn(CATEGORIES).withMessage('Invalid category'),
  body('subject').notEmpty().withMessage('Subject is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('urgency').isIn(URGENCY_LEVELS).withMessage('Invalid urgency level'),
  body('contactMethod').isIn(CONTACT_METHODS).withMessage('Invalid contact method')
];

// Create a new support request
router.post('/', [auth, ...validateRequest], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const supportRequest = new SupportRequest({
      ...req.body,
      user: req.user._id, // Use req.user._id which is populated by auth middleware
      status: 'pending' // Quote will be calculated by the pre-save hook in the model
    });

    await supportRequest.save();

    res.status(201).json({
      message: 'Support request created successfully',
      request: supportRequest
    });
  } catch (error) {
    console.error('Support request creation error:', error);
    res.status(500).json({ message: 'Server error while creating support request' });
  }
});

// Get all requests for the current user
router.get('/', auth, async (req, res) => {
  try {
    const requests = await SupportRequest.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedTo', 'name email'); // Populate assignedTo for better info

    res.json(requests);
  } catch (error) {
    console.error('Support requests fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching support requests' });
  }
});

// Get a specific request
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await SupportRequest.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'name email').populate('assignedTo', 'name email').populate('comments.user', 'name email');

    if (!request) {
      return res.status(404).json({ message: 'Support request not found' });
    }

    res.json(request);
  } catch (error) {
    console.error('Support request fetch error:', error);
    res.status(500).json({ message: 'Server error while fetching support request' });
  }
});

// Update a request (only certain fields by user)
router.patch('/:id', auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    // Allow users to update description and urgency if request is still pending
    const allowedUpdates = ['description', 'urgency']; 
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates. You can only update description or urgency.' });
    }

    const request = await SupportRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending' // Only allow updates for pending requests
    });

    if (!request) {
      return res.status(404).json({ message: 'Support request not found or cannot be updated at this stage.' });
    }

    updates.forEach(update => request[update] = req.body[update]);
    // The pre-save hook will recalculate the quote if urgency changes
    await request.save(); 

    res.json({
      message: 'Support request updated successfully',
      request
    });
  } catch (error) {
    console.error('Support request update error:', error);
    res.status(500).json({ message: 'Server error while updating support request' });
  }
});

// Cancel a request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await SupportRequest.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'pending' // Only allow cancellation of pending requests
    });

    if (!request) {
      return res.status(404).json({ message: 'Support request not found or cannot be cancelled at this stage.' });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      message: 'Support request cancelled successfully',
      request
    });
  } catch (error) {
    console.error('Support request cancellation error:', error);
    res.status(500).json({ message: 'Server error while cancelling support request' });
  }
});

module.exports = router; 