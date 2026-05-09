const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const pool = require('../config/database');

// Register new user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, passwordConfirm } = req.body;

    // Check if passwords match
    if (password !== passwordConfirm) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if email already exists
    const [rows] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if username already exists
    const [userRows] = await pool.query('SELECT username FROM users WHERE username = ?', [username]);
    if (userRows.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Insert user into database
    await pool.query('INSERT INTO users SET ?', { 
      username, 
      email, 
      password_hash: hashedPassword, 
      role: 'user' 
    });

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register Error:', error);
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error('Get Profile Error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};
