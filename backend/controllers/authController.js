const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const emailService = require('../utils/emailService');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user.id);
  const { password, ...userData } = user;
  res.status(statusCode).json({ success: true, token, user: userData });
};

// @desc Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, city } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const verificationToken = uuidv4();
    const userRole = role === 'manager' ? 'manager' : 'customer';
    const result = await pool.query(`
      INSERT INTO users (name, email, password, phone, role, city, verification_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, role, phone, city, is_verified, created_at
    `, [name, email, hashedPassword, phone, userRole, city, verificationToken]);

    const user = result.rows[0];
    try {
      await emailService.sendWelcomeEmail(email, name, verificationToken);
    } catch (emailErr) {
      console.log('Email not sent (may need SMTP config):', emailErr.message);
    }
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(401).json({ success: false, message: 'Account has been deactivated' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc Get current user
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, phone, avatar, city, address, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, city, address } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;
    const updates = [];
    const values = [];
    let idx = 1;
    if (name) { updates.push(`name=$${idx++}`); values.push(name); }
    if (phone) { updates.push(`phone=$${idx++}`); values.push(phone); }
    if (city) { updates.push(`city=$${idx++}`); values.push(city); }
    if (address) { updates.push(`address=$${idx++}`); values.push(address); }
    if (avatar) { updates.push(`avatar=$${idx++}`); values.push(avatar); }
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.user.id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(',')} WHERE id=$${idx} RETURNING id, name, email, role, phone, avatar, city, address`,
      values
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const isMatch = await bcrypt.compare(currentPassword, result.rows[0].password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No user with that email' });
    }
    const resetToken = uuidv4();
    const expire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await pool.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expire = $2 WHERE email = $3',
      [resetToken, expire, email]
    );
    try {
      await emailService.sendPasswordResetEmail(email, result.rows[0].name, resetToken);
    } catch (emailErr) {
      console.log('Reset email failed:', emailErr.message);
    }
    res.json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expire > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expire = NULL WHERE id = $2',
      [hashed, result.rows[0].id]
    );
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
