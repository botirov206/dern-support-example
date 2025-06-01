const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hardware', 'software', 'network', 'security', 'data', 'other']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  contactMethod: {
    type: String,
    required: true,
    enum: ['email', 'phone']
  },
  quote: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolution: {
    type: String,
    trim: true,
    default: ''
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Add index for faster queries
supportRequestSchema.index({ user: 1, createdAt: -1 });
supportRequestSchema.index({ status: 1 });

// Calculate quote based on urgency
supportRequestSchema.pre('save', function(next) {
  const basePrice = 50;
  const urgencyPrices = {
    'low': 10,
    'medium': 20,
    'high': 30
  };
  
  this.quote = basePrice + urgencyPrices[this.urgency];
  next();
});

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

module.exports = SupportRequest; 