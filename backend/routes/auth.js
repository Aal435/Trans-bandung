const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').notEmpty().withMessage('Email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('passwordConfirm').notEmpty().withMessage('Confirm password is required')
], authController.register);

// Login route
router.post('/login', [
  body('email').notEmpty().withMessage('Email is required'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get user profile (protected route)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
