const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/auth.middleware');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const router = express.Router();

// Get cart
router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product', 'name price images stock');

        if (!cart) {
            return res.json({
                success: true,
                data: { items: [], total: 0 }
            });
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching cart'
        });
    }
});

// Add item to cart
router.post('/items', [
    protect,
    [
        check('product', 'Product ID is required').not().isEmpty(),
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
    ]
], async (req, res) => {
    try {
        const { product, quantity } = req.body;

        // Check if product exists and has enough stock
        const productDoc = await Product.findById(product);
        if (!productDoc) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (productDoc.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = new Cart({ user: req.user._id, items: [] });
        }

        // Check if item already exists in cart
        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === product
        );

        if (itemIndex > -1) {
            // Update quantity if item exists
            cart.items[itemIndex].quantity = quantity;
        } else {
            // Add new item
            cart.items.push({ product, quantity });
        }

        await cart.save();

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error adding item to cart'
        });
    }
});

// Update cart item quantity
router.put('/items/:productId', [
    protect,
    [
        check('quantity', 'Quantity must be at least 1').isInt({ min: 1 })
    ]
], async (req, res) => {
    try {
        const { quantity } = req.body;
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check stock
        const product = await Product.findById(productId);
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating cart item'
        });
    }
});

// Remove item from cart
router.delete('/items/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(item => 
            item.product.toString() !== productId
        );

        await cart.save();

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error removing item from cart'
        });
    }
});

// Clear cart
router.delete('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error clearing cart'
        });
    }
});

module.exports = router; 