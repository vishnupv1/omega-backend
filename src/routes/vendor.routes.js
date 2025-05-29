const express = require('express');
const { check } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const router = express.Router();

// Get vendor profile
router.get('/profile', protect, authorize('vendor'), async (req, res) => {
    try {
        const vendor = await User.findById(req.user._id)
            .select('-password')
            .populate('products');
        
        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor profile'
        });
    }
});

// Get vendor products
router.get('/products', protect, authorize('vendor'), async (req, res) => {
    try {
        const products = await Product.find({ vendor: req.user._id })
            .populate('category', 'name')
            .sort('-createdAt');

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor products'
        });
    }
});

// Get vendor orders
router.get('/orders', protect, authorize('vendor'), async (req, res) => {
    try {
        const orders = await Order.find({
            'items.product': { $in: await Product.find({ vendor: req.user._id }).select('_id') }
        })
        .populate('user', 'firstName lastName email')
        .populate('items.product', 'name images price')
        .sort('-createdAt');

        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching vendor orders'
        });
    }
});

// Update vendor profile
router.put('/profile', [
    protect,
    authorize('vendor'),
    [
        check('firstName', 'First name is required').not().isEmpty(),
        check('lastName', 'Last name is required').not().isEmpty(),
        check('phone', 'Phone number is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        
        const vendor = await User.findById(req.user._id);
        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        vendor.firstName = firstName;
        vendor.lastName = lastName;
        vendor.phone = phone;
        if (address) vendor.address = address;

        await vendor.save();

        res.json({
            success: true,
            data: vendor
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating vendor profile'
        });
    }
});

module.exports = router; 