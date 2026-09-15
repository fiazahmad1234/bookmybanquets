const pool = require('../config/database');

exports.getVendors = async (req, res) => {
  try {
    const { vendor_type, city, search, page = 1, limit = 12 } = req.query;
    let where = ['v.is_active = true', 'v.is_approved = true'];
    const params = [];
    let idx = 1;
    if (vendor_type) { where.push(`v.vendor_type = $${idx++}`); params.push(vendor_type); }
    if (city) { where.push(`LOWER(v.city) = LOWER($${idx++})`); params.push(city); }
    if (search && search.trim()) {
      const searchParam = `%${search.trim()}%`;
      where.push(`(LOWER(v.business_name) LIKE LOWER($${idx++}) OR LOWER(v.description) LIKE LOWER($${idx++}) OR LOWER(v.vendor_type) LIKE LOWER($${idx++}))`);
      params.push(searchParam, searchParam, searchParam);
    }
    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);
    const result = await pool.query(`
      SELECT v.*, u.name as owner_name, u.phone as owner_phone
      FROM vendors v JOIN users u ON v.user_id = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY v.avg_rating DESC LIMIT $${idx++} OFFSET $${idx}
    `, params);
    res.json({ success: true, vendors: result.rows });
  } catch (err) {
    console.error('Get vendors error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { business_name, vendor_type, description, price_per_event, city, phone, email } = req.body;
    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(`
      INSERT INTO vendors (user_id, business_name, vendor_type, description, price_per_event, city, phone, email, cover_image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [req.user.id, business_name, vendor_type, description, price_per_event, city, phone, email, cover_image]);
    res.status(201).json({ success: true, vendor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};