const Order = require('../models/order.model');
const Product = require('../models/product.model');
const { validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create new order
exports.createOrder = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            items,
            shippingAddress,
            paymentMethod,
            couponApplied
        } = req.body;

        // Calculate total amount and validate products
        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for product: ${product.name}`
                });
            }

            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            // Update product stock
            product.stock -= item.quantity;
            await product.save();
        }

        // Apply coupon if provided
        let discountAmount = 0;
        if (couponApplied) {
            // Add coupon logic here
            // discountAmount = calculateDiscount(totalAmount, couponApplied);
        }

        // Calculate shipping cost
        const shippingCost = calculateShippingCost(shippingAddress);

        // Calculate tax
        const taxAmount = calculateTax(totalAmount - discountAmount);

        // Create order
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount: totalAmount - discountAmount + shippingCost + taxAmount,
            shippingAddress,
            paymentMethod,
            couponApplied,
            discountAmount,
            shippingCost,
            taxAmount
        });

        // Create payment intent if using Stripe
        if (paymentMethod === 'stripe') {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.totalAmount * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    orderId: order._id.toString()
                }
            });

            order.paymentIntentId = paymentIntent.id;
        }

        await order.save();

        res.status(201).json({
            success: true,
            data: order,
            clientSecret: paymentMethod === 'stripe' ? paymentIntent.client_secret : undefined
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating order'
        });
    }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
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
            message: 'Error fetching orders'
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'name images price')
            .populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to view this order
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order'
            });
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order'
        });
    }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to update this order
        if (req.user.role !== 'admin' && req.user.role !== 'vendor') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this order'
            });
        }

        order.orderStatus = status;
        if (status === 'delivered') {
            order.actualDeliveryDate = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};

// Cancel order
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if user is authorized to cancel this order
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this order'
            });
        }

        // Check if order can be cancelled
        if (order.orderStatus !== 'pending' && order.orderStatus !== 'processing') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.stock += item.quantity;
                await product.save();
            }
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
};

// Helper functions
function calculateShippingCost(address) {
    // Add shipping cost calculation logic based on address
    return 10; // Default shipping cost
}

function calculateTax(amount) {
    // Add tax calculation logic based on location
    return amount * 0.1; // 10% tax
} 