const pool = require('../config/database');

// @desc Create review
exports.createReview = async (req, res) => {
  try {
    const { booking_id, rating, cleanliness_rating, service_rating, value_rating, comment } = req.body;
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2',
      [booking_id, req.user.id]
    );
    if (!booking.rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.rows[0].booking_status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed bookings' });
    }
    const existing = await pool.query('SELECT id FROM reviews WHERE booking_id = $1', [booking_id]);
    if (existing.rows[0]) return res.status(400).json({ success: false, message: 'Already reviewed this booking' });

    const result = await pool.query(`
      INSERT INTO reviews (booking_id, customer_id, hall_id, rating, cleanliness_rating, service_rating, value_rating, comment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [booking_id, req.user.id, booking.rows[0].hall_id, rating, cleanliness_rating, service_rating, value_rating, comment]);

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get reviews for a hall
exports.getHallReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const result = await pool.query(`
      SELECT r.*, u.name as customer_name, u.avatar as customer_avatar
      FROM reviews r JOIN users u ON r.customer_id = u.id
      WHERE r.hall_id = $1 ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.params.hall_id, Number(limit), offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM reviews WHERE hall_id = $1', [req.params.hall_id]);
    const statsResult = await pool.query(`
      SELECT AVG(rating) as avg_rating, AVG(cleanliness_rating) as avg_cleanliness,
        AVG(service_rating) as avg_service, AVG(value_rating) as avg_value,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM reviews WHERE hall_id = $1
    `, [req.params.hall_id]);

    res.json({
      success: true,
      reviews: result.rows,
      total: parseInt(countResult.rows[0].count),
      stats: statsResult.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Manager reply to review
exports.replyToReview = async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await pool.query(`
      SELECT r.*, h.manager_id FROM reviews r JOIN halls h ON r.hall_id = h.id WHERE r.id = $1
    `, [req.params.id]);
    if (!review.rows[0]) return res.status(404).json({ success: false, message: 'Review not found' });
    if (review.rows[0].manager_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const result = await pool.query(
      'UPDATE reviews SET manager_reply = $1, manager_replied_at = NOW() WHERE id = $2 RETURNING *',
      [reply, req.params.id]
    );
    res.json({ success: true, review: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
