const express = require('express');
const { check } = require('express-validator');
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected routes
router.post('/', [
    protect,
    authorize('vendor', 'admin'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required').isNumeric(),
        check('category', 'Category is required').not().isEmpty(),
        check('stock', 'Stock is required').isNumeric(),
        check('sku', 'SKU is required').not().isEmpty()
    ]
], productController.createProduct);

router.put('/:id', [
    protect,
    authorize('vendor', 'admin'),
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required').isNumeric(),
        check('category', 'Category is required').not().isEmpty(),
        check('stock', 'Stock is required').isNumeric()
    ]
], productController.updateProduct);

router.delete('/:id', [
    protect,
    authorize('vendor', 'admin')
], productController.deleteProduct);

// Product rating
router.post('/:id/ratings', [
    protect,
    [
        check('rating', 'Rating is required').isInt({ min: 1, max: 5 }),
        check('review', 'Review is required').not().isEmpty()
    ]
], productController.addRating);

module.exports = router; 