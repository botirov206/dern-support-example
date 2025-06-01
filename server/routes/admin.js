const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const SupportRequest = require('../models/SupportRequest');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Article = require('../models/Article');

const router = express.Router();

// Get admin dashboard data
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
    try {
        // Get total users count
        const totalUsers = await User.countDocuments();

        // Get active requests count
        const activeRequests = await SupportRequest.countDocuments({
            status: { $in: ['pending', 'in-progress'] }
        });

        // Get resolved requests today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = await SupportRequest.countDocuments({
            status: 'completed',
            updatedAt: { $gte: today }
        });

        // Calculate revenue today
        const completedRequests = await SupportRequest.find({
            status: 'completed',
            updatedAt: { $gte: today }
        });
        const revenueToday = completedRequests.reduce((total, request) => total + request.quote, 0);

        // Get recent requests
        const recentRequests = await SupportRequest.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('-password');

        // Get system status (mock data for now)
        const systemStatus = {
            memoryUsage: '45%',
            activeStaff: 3,
            avgResponseTime: '2.5 hours',
            satisfactionRate: '95%'
        };

        res.json({
            totalUsers,
            activeRequests,
            resolvedToday,
            revenueToday,
            recentRequests,
            recentUsers,
            systemStatus
        });
    } catch (error) {
        console.error('Admin dashboard data fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data' });
    }
});

// Get all support requests with pagination and filters
router.get('/requests', [auth, adminAuth], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const urgency = req.query.urgency;

        const query = {};
        if (status) query.status = status;
        if (urgency) query.urgency = urgency;

        const requests = await SupportRequest.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('user', 'name email');

        const total = await SupportRequest.countDocuments(query);

        res.json({
            requests,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Support requests fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching requests' });
    }
});

// Get a single support request by ID
router.get('/requests/:id', [auth, adminAuth], async (req, res) => {
    try {
        const request = await SupportRequest.findById(req.params.id)
            .populate('user', 'name email') // Populate user details
            .populate('assignedTo', 'name email'); // Populate assigned admin/technician details

        if (!request) {
            return res.status(404).json({ message: 'Support request not found' });
        }
        res.json(request);
    } catch (error) {
        console.error('Single support request fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching single request' });
    }
});

// Update support request status
router.patch('/requests/:id', [auth, adminAuth], async (req, res) => {
    try {
        const { status, assignedTo, resolution, quote } = req.body;
        const request = await SupportRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Support request not found' });
        }

        if (status) request.status = status;
        if (assignedTo) request.assignedTo = assignedTo;
        if (resolution) request.resolution = resolution;
        if (quote) request.quote = quote;

        await request.save();

        res.json({
            message: 'Support request updated successfully',
            request
        });
    } catch (error) {
        console.error('Support request update error:', error);
        res.status(500).json({ message: 'Server error while updating request' });
    }
});

// Get all users with pagination and filters
router.get('/users', [auth, adminAuth], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        
        // Extract filter parameters
        const { search, role, status, accountType } = req.query;

        const query = {};

        if (accountType) {
            query.accountType = accountType;
        }
        if (role) {
            query.role = role;
        }
        if (status) {
            query.status = status;
        }
        if (search) {
            const searchRegex = new RegExp(search, 'i'); 
            query.$or = [
                { name: searchRegex },
                { email: searchRegex }
            ];
        }

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            users,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error('Users fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

// Update user status (e.g., activate/deactivate)
router.patch('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Explicitly update only allowed fields from req.body for this route
        if (req.body.hasOwnProperty('status')) {
            if (!['active', 'inactive', 'suspended'].includes(req.body.status)){
                return res.status(400).json({ message: 'Invalid status value.' });
            }
            user.status = req.body.status;
        }
        if (req.body.hasOwnProperty('role')) { 
            if (!['user', 'admin'].includes(req.body.role)){
                return res.status(400).json({ message: 'Invalid role value.' });
            }
            user.role = req.body.role;
        }
        if (req.body.hasOwnProperty('accountType')) {
            if (!['individual', 'business'].includes(req.body.accountType)){
                return res.status(400).json({ message: 'Invalid accountType value.' });
            }
            user.accountType = req.body.accountType;
        }

        await user.save();

        res.json({
            message: 'User updated successfully',
            user
        });
    } catch (error) {
        console.error('User update error:', error);
        if (error.name === 'ValidationError') {
             return res.status(400).json({ 
                message: 'Validation failed while updating user.',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({ message: 'Server error while updating user' });
    }
});

// Get a single user by ID
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Single user fetch error:', error);
        // Check for CastError (invalid ObjectId format)
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        res.status(500).json({ message: 'Server error while fetching user' });
    }
});

// Get all articles for admin management (can add pagination/filters later)
router.get('/articles', [auth, adminAuth], async (req, res) => {
    try {
        // For now, fetch all articles. Add pagination/filters as needed.
        // Example: const page = parseInt(req.query.page) || 1;
        // Example: const limit = parseInt(req.query.limit) || 10;

        const articles = await Article.find().sort({ updatedAt: -1 });
        // const total = await Article.countDocuments();

        res.json({
            articles,
            // total,
            // pages: Math.ceil(total / limit),
            // currentPage: page
        });
    } catch (error) {
        console.error('Admin articles fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching articles for admin' });
    }
});

// Get system metrics
router.get('/metrics', [auth, adminAuth], async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get various metrics
        const metrics = {
            users: {
                total: await User.countDocuments(),
                newToday: await User.countDocuments({ createdAt: { $gte: today } })
            },
            requests: {
                total: await SupportRequest.countDocuments(),
                pending: await SupportRequest.countDocuments({ status: 'pending' }),
                inProgress: await SupportRequest.countDocuments({ status: 'in-progress' }),
                completed: await SupportRequest.countDocuments({ status: 'completed' })
            },
            revenue: {
                total: (await SupportRequest.find({ status: 'completed' }))
                    .reduce((total, request) => total + request.quote, 0),
                today: (await SupportRequest.find({ 
                    status: 'completed',
                    updatedAt: { $gte: today }
                })).reduce((total, request) => total + request.quote, 0)
            }
        };

        res.json(metrics);
    } catch (error) {
        console.error('Metrics fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching metrics' });
    }
});

module.exports = router; 