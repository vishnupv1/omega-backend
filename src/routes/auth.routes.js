const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// Register route
router.post('/register', [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').not().isEmpty()
], authController.register);

// Login route
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], authController.login);

// Forgot password route
router.post('/forgot-password', [
    check('email', 'Please include a valid email').isEmail()
], authController.forgotPassword);

// Reset password route
router.post('/reset-password', [
    check('token', 'Token is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController.resetPassword);

// Verify email route
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router; 