const pool = require('../config/database');

// @desc Get all halls with search and filters
exports.getHalls = async (req, res) => {
  try {
    const {
      city, hall_type, min_price, max_price, min_capacity, max_capacity,
      is_ac, has_kitchen, has_stage, catering_available, outdoor_space,
      search, sort = 'avg_rating', order = 'DESC', page = 1, limit = 10
    } = req.query;

    // Build WHERE conditions and params array cleanly
    let whereConditions = ['h.is_active = true', 'h.is_approved = true'];
    let params = [];

    if (city && city.trim()) {
      params.push(city.trim());
      whereConditions.push(`LOWER(h.city) = LOWER($${params.length})`);
    }
    if (hall_type && hall_type !== 'all' && hall_type.trim()) {
      params.push(hall_type.trim());
      whereConditions.push(`h.hall_type = $${params.length}`);
    }
    if (min_price && !isNaN(min_price)) {
      params.push(Number(min_price));
      whereConditions.push(`h.price_per_day >= $${params.length}`);
    }
    if (max_price && !isNaN(max_price)) {
      params.push(Number(max_price));
      whereConditions.push(`h.price_per_day <= $${params.length}`);
    }
    if (min_capacity && !isNaN(min_capacity)) {
      params.push(Number(min_capacity));
      whereConditions.push(`h.capacity_max >= $${params.length}`);
    }
    if (max_capacity && !isNaN(max_capacity)) {
      params.push(Number(max_capacity));
      whereConditions.push(`h.capacity_max <= $${params.length}`);
    }
    if (is_ac === 'true') { whereConditions.push('h.is_ac = true'); }
    if (has_kitchen === 'true') { whereConditions.push('h.has_kitchen = true'); }
    if (has_stage === 'true') { whereConditions.push('h.has_stage = true'); }
    if (catering_available === 'true') { whereConditions.push('h.catering_available = true'); }
    if (outdoor_space === 'true') { whereConditions.push('h.outdoor_space = true'); }
    if (search && search.trim()) {
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam);
      const s1 = params.length;
      params.push(searchParam);
      const s2 = params.length;
      params.push(searchParam);
      const s3 = params.length;
      whereConditions.push(
        `(LOWER(h.name) LIKE LOWER($${s1}) OR LOWER(h.description) LIKE LOWER($${s2}) OR LOWER(h.address) LIKE LOWER($${s3}))`
      );
    }

    const validSorts = ['price_per_day', 'avg_rating', 'capacity_max', 'created_at', 'total_bookings'];
    const sortField = validSorts.includes(sort) ? `h.${sort}` : 'h.avg_rating';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = whereConditions.join(' AND ');

    // Count total (use same params without LIMIT/OFFSET)
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM halls h WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const offset = (pageNum - 1) * limitNum;

    // Add LIMIT and OFFSET at the end
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    const queryParams = [...params, limitNum, offset];

    const result = await pool.query(`
      SELECT h.*,
        u.name as manager_name,
        (SELECT image_url FROM hall_images WHERE hall_id = h.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT json_agg(image_url) FROM (SELECT image_url FROM hall_images WHERE hall_id = h.id LIMIT 5) img) as images
      FROM halls h
      JOIN users u ON h.manager_id = u.id
      WHERE ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `, queryParams);

    res.json({
      success: true,
      count: result.rows.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      halls: result.rows
    });
  } catch (err) {
    console.error('Get halls error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc Get single hall
exports.getHall = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*, u.name as manager_name, u.email as manager_email, u.phone as manager_phone,
        (SELECT json_agg(json_build_object('id', id, 'image_url', image_url, 'caption', caption, 'is_primary', is_primary))
         FROM hall_images WHERE hall_id = h.id) as images,
        (SELECT json_agg(json_build_object('id', id, 'amenity_name', amenity_name, 'amenity_icon', amenity_icon))
         FROM hall_amenities WHERE hall_id = h.id) as amenities
      FROM halls h
      JOIN users u ON h.manager_id = u.id
      WHERE h.id = $1 AND h.is_active = true
    `, [req.params.id]);

    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Hall not found' });

    // Get recent reviews
    const reviews = await pool.query(`
      SELECT r.*, u.name as customer_name, u.avatar as customer_avatar
      FROM reviews r JOIN users u ON r.customer_id = u.id
      WHERE r.hall_id = $1
      ORDER BY r.created_at DESC LIMIT 5
    `, [req.params.id]);

    res.json({ success: true, hall: result.rows[0], reviews: reviews.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Create hall (manager)
exports.createHall = async (req, res) => {
  try {
    const {
      name, description, address, city, state, capacity_min, capacity_max,
      price_per_day, price_per_hour, hall_type, parking_capacity,
      is_ac, has_kitchen, has_stage, has_projector, has_sound_system,
      has_wifi, has_decoration, catering_available, outdoor_space,
      cancellation_policy, terms_conditions
    } = req.body;

    const cover_image = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(`
      INSERT INTO halls (manager_id, name, description, address, city, state, capacity_min, capacity_max,
        price_per_day, price_per_hour, hall_type, parking_capacity, is_ac, has_kitchen, has_stage,
        has_projector, has_sound_system, has_wifi, has_decoration, catering_available, outdoor_space,
        cancellation_policy, terms_conditions, cover_image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
      RETURNING *
    `, [req.user.id, name, description, address, city, state, capacity_min || 50, capacity_max,
        price_per_day, price_per_hour, hall_type, parking_capacity || 0,
        is_ac === 'true', has_kitchen === 'true', has_stage === 'true',
        has_projector === 'true', has_sound_system === 'true', has_wifi === 'true',
        has_decoration === 'true', catering_available === 'true', outdoor_space === 'true',
        cancellation_policy, terms_conditions, cover_image]);

    res.status(201).json({ success: true, hall: result.rows[0] });
  } catch (err) {
    console.error('Create hall error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Update hall
exports.updateHall = async (req, res) => {
  try {
    const hallCheck = await pool.query('SELECT manager_id FROM halls WHERE id = $1', [req.params.id]);
    if (!hallCheck.rows[0]) return res.status(404).json({ success: false, message: 'Hall not found' });
    if (hallCheck.rows[0].manager_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const fields = ['name', 'description', 'address', 'city', 'state', 'capacity_min', 'capacity_max',
      'price_per_day', 'price_per_hour', 'hall_type', 'parking_capacity', 'is_ac', 'has_kitchen',
      'has_stage', 'has_projector', 'has_sound_system', 'has_wifi', 'has_decoration',
      'catering_available', 'outdoor_space', 'cancellation_policy', 'terms_conditions'];
    const updates = [];
    const values = [];
    let idx = 1;
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field}=$${idx++}`);
        values.push(req.body[field]);
      }
    }
    if (req.file) { updates.push(`cover_image=$${idx++}`); values.push(`/uploads/${req.file.filename}`); }
    if (updates.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE halls SET ${updates.join(',')} WHERE id=$${idx} RETURNING *`,
      values
    );
    res.json({ success: true, hall: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Delete hall
exports.deleteHall = async (req, res) => {
  try {
    const hallCheck = await pool.query('SELECT manager_id FROM halls WHERE id = $1', [req.params.id]);
    if (!hallCheck.rows[0]) return res.status(404).json({ success: false, message: 'Hall not found' });
    if (hallCheck.rows[0].manager_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pool.query('UPDATE halls SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Hall deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Check hall availability
exports.checkAvailability = async (req, res) => {
  try {
    const { date, start_time, end_time } = req.query;
    const result = await pool.query(`
      SELECT id, event_date, start_time, end_time, booking_status
      FROM bookings
      WHERE hall_id = $1 AND event_date = $2
        AND booking_status IN ('pending', 'confirmed')
        AND (
          (start_time <= $3 AND end_time > $3) OR
          (start_time < $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
    `, [req.params.id, date, start_time, end_time]);
    res.json({ success: true, available: result.rows.length === 0, conflicts: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Get hall calendar (booked dates)
exports.getHallCalendar = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
    const result = await pool.query(`
      SELECT event_date, booking_status, start_time, end_time
      FROM bookings
      WHERE hall_id = $1 AND event_date BETWEEN $2 AND $3
        AND booking_status IN ('pending', 'confirmed')
      ORDER BY event_date
    `, [req.params.id, startDate, endDate]);
    res.json({ success: true, bookedDates: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Compare halls
exports.compareHalls = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ success: false, message: 'Please provide hall IDs' });
    const hallIds = ids.split(',').slice(0, 4); // max 4 halls
    const result = await pool.query(`
      SELECT h.*, u.name as manager_name,
        (SELECT image_url FROM hall_images WHERE hall_id = h.id AND is_primary = true LIMIT 1) as primary_image
      FROM halls h JOIN users u ON h.manager_id = u.id
      WHERE h.id = ANY($1::uuid[]) AND h.is_active = true
    `, [hallIds]);
    res.json({ success: true, halls: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc AI-powered hall recommendations
exports.getAIRecommendations = async (req, res) => {
  try {
    const { event_type, guest_count, city, budget, date } = req.query;
    let whereConditions = ['h.is_active = true', 'h.is_approved = true'];
    const params = [];
    let idx = 1;
    if (city) { whereConditions.push(`LOWER(h.city) = LOWER($${idx++})`); params.push(city); }
    if (guest_count) { whereConditions.push(`h.capacity_max >= $${idx++}`); params.push(Number(guest_count)); }
    if (budget) { whereConditions.push(`h.price_per_day <= $${idx++}`); params.push(Number(budget)); }
    if (event_type === 'wedding') { whereConditions.push(`h.hall_type IN ('wedding', 'all')`); }
    else if (event_type === 'corporate') { whereConditions.push(`h.hall_type IN ('corporate', 'all')`); }

    const result = await pool.query(`
      SELECT h.*, u.name as manager_name,
        (SELECT image_url FROM hall_images WHERE hall_id = h.id AND is_primary = true LIMIT 1) as primary_image,
        (h.avg_rating * 0.4 + (1 - h.price_per_day / 300000.0) * 0.3 + (h.total_reviews / 100.0) * 0.3) as ai_score
      FROM halls h JOIN users u ON h.manager_id = u.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ai_score DESC LIMIT 5
    `, params);

    // Generate AI reason for each hall
    const recommendations = result.rows.map(hall => ({
      ...hall,
      ai_reason: generateAIReason(hall, { event_type, guest_count, budget })
    }));

    res.json({ success: true, recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

function generateAIReason(hall, preferences) {
  const reasons = [];
  if (hall.avg_rating >= 4.5) reasons.push(`Highly rated at ${hall.avg_rating}/5 stars`);
  if (preferences.event_type === 'wedding' && hall.has_decoration) reasons.push('Offers wedding decoration services');
  if (preferences.event_type === 'corporate' && hall.has_projector) reasons.push('Equipped with projector for presentations');
  if (hall.catering_available) reasons.push('In-house catering available');
  if (hall.outdoor_space) reasons.push('Beautiful outdoor space included');
  if (hall.parking_capacity > 50) reasons.push(`Ample parking for ${hall.parking_capacity} vehicles`);
  if (preferences.guest_count && hall.capacity_max >= preferences.guest_count * 1.2) reasons.push('Spacious capacity for your guests');
  return reasons.length > 0 ? reasons.join(' • ') : 'Excellent match for your requirements';
}

// @desc Get cities list
exports.getCities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT city, COUNT(*) as hall_count 
      FROM halls WHERE is_active = true AND is_approved = true
      GROUP BY city ORDER BY hall_count DESC
    `);
    res.json({ success: true, cities: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Manager's halls
exports.getManagerHalls = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT h.*,
        (SELECT COUNT(*) FROM bookings WHERE hall_id = h.id AND booking_status = 'confirmed') as confirmed_bookings,
        (SELECT COUNT(*) FROM bookings WHERE hall_id = h.id AND booking_status = 'pending') as pending_bookings,
        (SELECT image_url FROM hall_images WHERE hall_id = h.id AND is_primary = true LIMIT 1) as primary_image
      FROM halls h WHERE h.manager_id = $1
      ORDER BY h.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, halls: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc Approve/reject hall (admin)
exports.approveHall = async (req, res) => {
  try {
    const { is_approved } = req.body;
    const result = await pool.query(
      'UPDATE halls SET is_approved = $1 WHERE id = $2 RETURNING *',
      [is_approved, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ success: false, message: 'Hall not found' });

    // Create notification for manager
    await pool.query(`
      INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
      VALUES ($1, $2, $3, $4, $5, 'hall')
    `, [result.rows[0].manager_id,
        is_approved ? 'Hall Approved!' : 'Hall Rejected',
        is_approved ? `Your hall "${result.rows[0].name}" has been approved and is now live!` : `Your hall "${result.rows[0].name}" was not approved. Please contact support.`,
        is_approved ? 'success' : 'warning',
        req.params.id]);

    res.json({ success: true, hall: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};