const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  accountType: {
    type: String,
    required: [true, 'Account type is required'],
    enum: ['individual', 'business']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    default: ''
  },
  preferences: {
    emailUpdates: {
      type: Boolean,
      default: true
    },
    smsUpdates: {
      type: Boolean,
      default: false
    },
    newsletter: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive information when converting to JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Add index for faster queries
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ accountType: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User; 