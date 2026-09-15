const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, role, phone, avatar, city, is_active FROM users WHERE id = $1',
      [decoded.id]
    );
    if (!result.rows[0]) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }
    if (!result.rows[0].is_active) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not allowed to access this resource.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
