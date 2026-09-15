const pool = require('../config/database');

// NOTIFICATION CONTROLLER
exports.getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [req.user.id]
    );
    const unreadCount = result.rows.filter(n => !n.is_read).length;
    res.json({ success: true, notifications: result.rows, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    if (req.params.id === 'all') {
      await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
    } else {
      await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    }
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// MESSAGE CONTROLLER
exports.getConversations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
        CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END as other_user_id,
        u.name as other_user_name, u.avatar as other_user_avatar, u.role as other_user_role,
        m.message as last_message, m.created_at as last_message_time,
        (SELECT COUNT(*) FROM messages WHERE sender_id = other_user_id AND receiver_id = $1 AND is_read = false) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
      WHERE m.sender_id = $1 OR m.receiver_id = $1
      ORDER BY other_user_id, m.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, conversations: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { other_user_id } = req.params;
    const result = await pool.query(`
      SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
      FROM messages m JOIN users u ON m.sender_id = u.id
      WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1)
      ORDER BY m.created_at ASC LIMIT 100
    `, [req.user.id, other_user_id]);
    // Mark as read
    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false',
      [other_user_id, req.user.id]
    );
    res.json({ success: true, messages: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiver_id, message, booking_id, hall_id } = req.body;
    const result = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, message, booking_id, hall_id)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [req.user.id, receiver_id, message, booking_id, hall_id]);
    res.status(201).json({ success: true, message: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
