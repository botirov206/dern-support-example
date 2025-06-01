const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['hardware', 'software'],
    required: [true, 'Category is required']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    default: '/assets/placeholder.jpg'
  },
  summary: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
articleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article; 