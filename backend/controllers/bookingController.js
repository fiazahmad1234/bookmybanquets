const pool = require('../config/database');
const emailService = require('../utils/emailService');

// @desc Create booking
exports.createBooking = async (req, res) => {
  try {
    const {
      hall_id, event_type, event_date, start_time, end_time,
      guest_count, special_requests, coupon_code, additional_services
    } = req.body;

    // Check hall exists and is available
    const hallResult = await pool.query(
      'SELECT * FROM halls WHERE id = $1 AND is_active = true AND is_approved = true',
      [hall_id]
    );
    if (!hallResult.rows[0]) return res.status(404).json({ success: false, message: 'Hall not found' });
    const hall = hallResult.rows[0];

    // Check capacity
    if (guest_count > hall.capacity_max) {
      return res.status(400).json({ success: false, message: `Hall capacity is ${hall.capacity_max}. Your guest count exceeds this.` });
    }

    // Check availability for that date
    const conflict = await pool.query(`
      SELECT id FROM bookings 
      WHERE hall_id = $1 AND event_date = $2 AND booking_status IN ('pending', 'confirmed')
      AND ((start_time <= $3 AND end_time > $3) OR (start_time < $4 AND end_time >= $4) OR (start_time >= $3 AND end_time <= $4))
    `, [hall_id, event_date, start_time, end_time]);

    if (conflict.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Hall is not available for the selected date and time' });
    }

    // Calculate hours and price
    const [startH, startM] = start_time.split(':').map(Number);
    const [endH, endM] = end_time.split(':').map(Number);
    const hours = (endH + endM / 60) - (startH + startM / 60);
    let totalAmount = hall.price_per_hour ? hall.price_per_hour * hours : hall.price_per_day;

    // Apply coupon discount
    let discountAmount = 0;
    if (coupon_code) {
      if (coupon_code === 'FIRST10') discountAmount = totalAmount * 0.1;
      else if (coupon_code === 'SAVE500') discountAmount = 500;
      else if (coupon_code === 'WELCOME15') discountAmount = totalAmount * 0.15;
    }
    totalAmount -= discountAmount;

    // Add additional services price
    let servicesTotal = 0;
    if (additional_services && Array.isArray(additional_services)) {
      additional_services.forEach(s => { servicesTotal += (s.price || 0) * (s.quantity || 1); });
      totalAmount += servicesTotal;
    }

    const advancePayment = totalAmount * 0.25; // 25% advance
    const remainingPayment = totalAmount - advancePayment;

    // Create booking
    const bookingResult = await pool.query(`
      INSERT INTO bookings (customer_id, hall_id, event_type, event_date, start_time, end_time,
        guest_count, total_amount, advance_payment, remaining_payment, special_requests, coupon_code, discount_amount)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [req.user.id, hall_id, event_type, event_date, start_time, end_time,
        guest_count, totalAmount, advancePayment, remainingPayment,
        special_requests, coupon_code, discountAmount]);

    const booking = bookingResult.rows[0];

    // Add additional services
    if (additional_services && additional_services.length > 0) {
      for (const service of additional_services) {
        await pool.query(`
          INSERT INTO booking_services (booking_id, service_name, service_price, quantity)
          VALUES ($1, $2, $3, $4)
        `, [booking.id, service.name, service.price, service.quantity || 1]);
      }
    }

    // Update hall booking count
    await pool.query('UPDATE halls SET total_bookings = total_bookings + 1 WHERE id = $1', [hall_id]);

    // Create notifications
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES ($1, $2, $3, 'booking', $4, 'booking')
    `, [req.user.id, 'Booking Request Submitted', `Your booking for ${hall.name} on ${event_date} is pending confirmation.`, booking.id]);

    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES ($1, $2, $3, 'booking', $4, 'booking')
    `, [hall.manager_id, 'New Booking Request', `New booking request for ${hall.name} on ${event_date} from ${req.user.name}.`, booking.id]);

    // Send email
    try {
      const customerResult = await pool.query('SELECT email, name FROM users WHERE id = $1', [req.user.id]);
      await emailService.sendBookingConfirmationEmail(customerResult.rows[0].email, customerResult.rows[0].name, booking, hall);
    } catch (e) { console.log('Email failed:', e.message); }

    // Generate AI recommendation
    const aiRec = generateBookingAITips(hall, booking);
    await pool.query('UPDATE bookings SET ai_recommendation = $1 WHERE id = $2', [aiRec, booking.id]);

    res.status(201).json({ success: true, booking: { ...booking, ai_recommendation: aiRec } });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

function generateBookingAITips(hall, booking) {
  const tips = [];
  if (hall.catering_available) tips.push('💡 Book catering 2 weeks in advance for best menus');
  if (hall.has_decoration) tips.push('🌸 Request decoration consultation 1 month before event');
  if (booking.guest_count > 200) tips.push('🚗 Arrange shuttle service for large guest count');
  tips.push('📸 Book photography at least 3 months before your event');
  tips.push('💌 Send invitations 6-8 weeks in advance');
  return tips.join(' | ');
}

// @desc Get all bookings (with role-based filtering)
exports.getBookings = async (req, res) => {
  try {
    let query;
    let params;
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    if (req.user.role === 'customer') {
      let where = 'b.customer_id = $1';
      params = [req.user.id];
      if (status) { where += ' AND b.booking_status = $2'; params.push(status); }
      query = `SELECT b.*, h.name as hall_name, h.city as hall_city, h.cover_image as hall_image,
        h.address as hall_address FROM bookings b JOIN halls h ON b.hall_id = h.id
        WHERE ${where} ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);
    } else if (req.user.role === 'manager') {
      let where = 'h.manager_id = $1';
      params = [req.user.id];
      if (status) { where += ' AND b.booking_status = $2'; params.push(status); }
      query = `SELECT b.*, h.name as hall_name, h.city as hall_city, u.name as customer_name,
        u.email as customer_email, u.phone as customer_phone FROM bookings b
        JOIN halls h ON b.hall_id = h.id JOIN users u ON b.customer_id = u.id
        WHERE ${where} ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);
    } else {
      let where = '1=1';
      params = [];
      if (status) { where += ` AND b.booking_status = $${params.length + 1}`; params.push(status); }
      query = `SELECT b.*, h.name as hall_name, h.city as hall_city, u.name as customer_name,
        u.email as customer_email FROM bookings b JOIN halls h ON b.hall_id = h.id
        JOIN users u ON b.customer_id = u.id WHERE ${where}
        ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);
    }

    const result = await pool.query(query, params);
    res.json({ success: true, count: result.rows.length, bookings: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get single booking
exports.getBooking = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, h.name as hall_name, h.city as hall_city, h.address as hall_address,
        h.cover_image as hall_image, h.phone as hall_phone, h.manager_id,
        u.name as customer_name, u.email as customer_email, u.phone as customer_phone,
        (SELECT json_agg(json_build_object('service_name', service_name, 'service_price', service_price, 'quantity', quantity))
         FROM booking_services WHERE booking_id = b.id) as services
      FROM bookings b JOIN halls h ON b.hall_id = h.id JOIN users u ON b.customer_id = u.id
      WHERE b.id = $1
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = result.rows[0];

    // Permission check
    if (req.user.role === 'customer' && booking.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'manager' && booking.manager_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update booking status (manager)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, manager_notes } = req.body;
    const validStatuses = ['confirmed', 'rejected', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const bookingResult = await pool.query(`
      SELECT b.*, h.manager_id, h.name as hall_name FROM bookings b JOIN halls h ON b.hall_id = h.id WHERE b.id = $1
    `, [req.params.id]);

    if (!bookingResult.rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    const booking = bookingResult.rows[0];

    if (req.user.role === 'manager' && booking.manager_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { status, manager_notes };
    if (status === 'confirmed') updateData.confirmed_at = new Date();
    if (status === 'cancelled') updateData.cancelled_at = new Date();

    await pool.query(`
      UPDATE bookings SET booking_status = $1, manager_notes = $2 WHERE id = $3
    `, [status, manager_notes, req.params.id]);

    // Notify customer
    const statusMessages = {
      confirmed: `Great news! Your booking for ${booking.hall_name} on ${booking.event_date} has been confirmed!`,
      rejected: `Unfortunately, your booking for ${booking.hall_name} on ${booking.event_date} was not confirmed.`,
      cancelled: `Your booking for ${booking.hall_name} on ${booking.event_date} has been cancelled.`,
      completed: `Your event at ${booking.hall_name} is now marked as completed. We hope you had a great time!`
    };

    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES ($1, $2, $3, $4, $5, 'booking')
    `, [booking.customer_id, `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        statusMessages[status], status === 'confirmed' || status === 'completed' ? 'success' : 'warning', booking.id]);

    res.json({ success: true, message: `Booking ${status} successfully` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Cancel booking (customer)
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    const result = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND customer_id = $2',
      [req.params.id, req.user.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['pending', 'confirmed'].includes(result.rows[0].booking_status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    await pool.query(`
      UPDATE bookings SET booking_status = 'cancelled', cancellation_reason = $1, cancelled_at = NOW()
      WHERE id = $2
    `, [cancellation_reason, req.params.id]);
    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get booking stats for dashboard
exports.getBookingStats = async (req, res) => {
  try {
    let statsQuery;
    let params;
    if (req.user.role === 'manager') {
      statsQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE b.booking_status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE b.booking_status = 'confirmed') as confirmed_count,
          COUNT(*) FILTER (WHERE b.booking_status = 'completed') as completed_count,
          COUNT(*) FILTER (WHERE b.booking_status = 'cancelled') as cancelled_count,
          COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed'), 0) as total_revenue,
          COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'confirmed'), 0) as upcoming_revenue,
          COUNT(*) as total_bookings
        FROM bookings b JOIN halls h ON b.hall_id = h.id WHERE h.manager_id = $1
      `;
      params = [req.user.id];
    } else if (req.user.role === 'customer') {
      statsQuery = `
        SELECT
          COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_count,
          COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_count,
          COUNT(*) FILTER (WHERE booking_status = 'cancelled') as cancelled_count,
          COUNT(*) as total_bookings
        FROM bookings WHERE customer_id = $1
      `;
      params = [req.user.id];
    } else {
      statsQuery = `
        SELECT
          COUNT(*) FILTER (WHERE booking_status = 'pending') as pending_count,
          COUNT(*) FILTER (WHERE booking_status = 'confirmed') as confirmed_count,
          COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_count,
          COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'completed'), 0) as total_revenue,
          COUNT(*) as total_bookings
        FROM bookings
      `;
      params = [];
    }
    const result = await pool.query(statsQuery, params);
    res.json({ success: true, stats: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
