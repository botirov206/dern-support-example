const express = require('express');
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Validation middleware
const validateArticle = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('category').isIn(['hardware', 'software']).withMessage('Invalid category'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('tags').isArray().withMessage('Tags must be an array')
];

// Get all articles with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, category, tag } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = tag;
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 });
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific article
router.get('/:id', async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create article (admin only)
router.post('/', [auth, adminAuth, ...validateArticle], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const article = new Article(req.body);
    await article.save();
    
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update article (admin only)
router.put('/:id', [auth, adminAuth, ...validateArticle], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const article = await Article.findById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const updates = Object.keys(req.body);
    updates.forEach(update => article[update] = req.body[update]);
    
    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete article (admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 