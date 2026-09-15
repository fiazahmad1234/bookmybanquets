const pool = require('../config/database');

// @desc Get admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [users, halls, bookings, revenue, vendors] = await Promise.all([
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE role='customer') as customers,
        COUNT(*) FILTER (WHERE role='manager') as managers, COUNT(*) FILTER (WHERE created_at > NOW()-INTERVAL '30 days') as new_this_month
        FROM users`),
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_approved=true) as approved,
        COUNT(*) FILTER (WHERE is_approved=false AND is_active=true) as pending FROM halls`),
      pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE booking_status='pending') as pending,
        COUNT(*) FILTER (WHERE booking_status='confirmed') as confirmed,
        COUNT(*) FILTER (WHERE booking_status='completed') as completed,
        COALESCE(SUM(total_amount) FILTER (WHERE booking_status='completed'), 0) as total_revenue FROM bookings`),
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) as monthly_revenue FROM bookings
        WHERE booking_status='completed' AND created_at > NOW()-INTERVAL '30 days'`),
      pool.query('SELECT COUNT(*) as total FROM vendors')
    ]);

    const monthlyTrend = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month,
        COUNT(*) as bookings,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM bookings WHERE created_at > NOW()-INTERVAL '6 months'
      GROUP BY month ORDER BY month
    `);

    res.json({
      success: true,
      stats: {
        users: users.rows[0],
        halls: halls.rows[0],
        bookings: bookings.rows[0],
        monthly_revenue: revenue.rows[0].monthly_revenue,
        vendors: vendors.rows[0],
        monthly_trend: monthlyTrend.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let where = '1=1';
    const params = [];
    let idx = 1;
    if (role) { where += ` AND role = $${idx++}`; params.push(role); }
    if (search) {
      where += ` AND (LOWER(name) LIKE LOWER($${idx++}) OR LOWER(email) LIKE LOWER($${idx++}))`;
      params.push(`%${search}%`, `%${search}%`);
      idx++;
    }
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);
    const result = await pool.query(
      `SELECT id, name, email, role, phone, city, is_active, is_verified, created_at FROM users
       WHERE ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx}`,
      params
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get all halls pending approval
exports.getPendingHalls = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*, u.name as manager_name, u.email as manager_email
      FROM halls h JOIN users u ON h.manager_id = u.id
      WHERE h.is_approved = false AND h.is_active = true
      ORDER BY h.created_at DESC
    `);
    res.json({ success: true, halls: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get all vendors pending approval
exports.getPendingVendors = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, u.name as owner_name, u.email as owner_email
      FROM vendors v JOIN users u ON v.user_id = u.id
      WHERE v.is_approved = false AND v.is_active = true
      ORDER BY v.created_at DESC
    `);
    res.json({ success: true, vendors: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.approveVendor = async (req, res) => {
  try {
    const { is_approved } = req.body;
    const result = await pool.query(
      'UPDATE vendors SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Vendor not found' });
    res.json({ success: true, vendor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
