const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const Wishlist = require('../models/wishlist.model');
const Product = require('../models/product.model');
const router = express.Router();

// Get wishlist
router.get('/', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate('items.product', 'name price images stock');

        if (!wishlist) {
            return res.json({
                success: true,
                data: { items: [] }
            });
        }

        res.json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist'
        });
    }
});

// Add item to wishlist
router.post('/items', [
    protect,
    [
        check('product', 'Product ID is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const { product } = req.body;

        // Check if product exists
        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            wishlist = new Wishlist({ user: req.user._id, items: [] });
        }

        // Check if item already exists in wishlist
        const itemExists = wishlist.items.some(item => 
            item.product.toString() === product
        );

        if (!itemExists) {
            wishlist.items.push({ product });
            await wishlist.save();
        }

        res.json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to wishlist'
        });
    }
});

// Remove item from wishlist
router.delete('/items/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = wishlist.items.filter(item => 
            item.product.toString() !== productId
        );

        await wishlist.save();

        res.json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error removing item from wishlist'
        });
    }
});

// Clear wishlist
router.delete('/', protect, async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.items = [];
        await wishlist.save();

        res.json({
            success: true,
            message: 'Wishlist cleared successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error clearing wishlist'
        });
    }
});

module.exports = router; 