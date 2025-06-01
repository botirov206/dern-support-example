require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const articleRoutes = require('./routes/articles');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dern-support')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);

// Page Routes - Landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/landing/index.html'));
});

// Page Routes - User Dashboard
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard/index.html'));
});

app.get('/submit-request', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard/submit-request.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/dashboard/account.html'));
});

app.get('/dashboard/knowledge-base', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/dashboard/knowledge-base.html'));
});

// Page Routes - Admin Dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin/index.html'));
});

app.get('/admin/requests', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin/requests.html'));
});

app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin/users.html'));
});

app.get('/admin/articles', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin/articles.html'));
});

app.get('/admin/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin/settings.html'));
});

// Shared Pages
app.get('/knowledge-base', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/shared/knowledge-base.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/shared/support.html'));
});

// Handle 404 - Page Not Found
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/pages/shared/404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 

