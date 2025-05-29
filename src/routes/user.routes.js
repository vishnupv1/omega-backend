const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const router = express.Router();

// Register new user
router.post('/register', [
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
        check('phone', 'Phone number is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, address } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create new user
        user = new User({
            firstName,
            lastName,
            email,
            password,
            phone,
            address
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error registering user'
        });
    }
});

// Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile'
        });
    }
});

// Update user profile
router.put('/profile', [
    protect,
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.firstName = firstName;
        user.lastName = lastName;
        user.phone = phone;
        if (address) user.address = address;

        await user.save();

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating user profile'
        });
    }
});

// Update user password
router.put('/password', [
    protect,
    [
        check('currentPassword', 'Current password is required').exists(),
        check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ]
], async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating password'
        });
    }
});

module.exports = router; 