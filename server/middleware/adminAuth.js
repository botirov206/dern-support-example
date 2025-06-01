const User = require('../models/User');

const adminAuth = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ message: 'Server error during admin authentication' });
    }
};

module.exports = adminAuth; 