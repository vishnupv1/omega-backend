const express = require('express');
const { check } = require('express-validator');
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Protected routes
router.use(protect);

// User routes
router.post('/', [
    [
        check('items', 'Items are required').isArray(),
        check('items.*.product', 'Product ID is required').not().isEmpty(),
        check('items.*.quantity', 'Quantity is required').isInt({ min: 1 }),
        check('shippingAddress', 'Shipping address is required').not().isEmpty(),
        check('paymentMethod', 'Payment method is required').isIn(['credit_card', 'debit_card', 'paypal', 'stripe'])
    ]
], orderController.createOrder);

router.get('/my-orders', orderController.getUserOrders);
router.get('/:id', orderController.getOrder);
router.post('/:id/cancel', orderController.cancelOrder);

// Admin/Vendor routes
router.put('/:id/status', [
    authorize('admin', 'vendor'),
    [
        check('status', 'Status is required').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    ]
], orderController.updateOrderStatus);

module.exports = router; 