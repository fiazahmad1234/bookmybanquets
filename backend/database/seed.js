const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Seeding database...');

    // ── USERS ──────────────────────────────────────────────────────────────
    const adminPass   = await bcrypt.hash('Admin@123',   12);
    const managerPass = await bcrypt.hash('Manager@123', 12);
    const custPass    = await bcrypt.hash('Customer@123',12);

    await client.query(`
      INSERT INTO users (name,email,password,role,phone,is_verified,city)
      VALUES ('Super Admin','admin@bookmybanquets.com',$1,'admin','+92-300-0000000',true,'Lahore')
      ON CONFLICT (email) DO NOTHING`, [adminPass]);

    const m1 = await client.query(`
      INSERT INTO users (name,email,password,role,phone,is_verified,city)
      VALUES ('Ahmed Khan','ahmed@manager.com',$1,'manager','+92-321-1111111',true,'Lahore')
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [managerPass]);

    const m2 = await client.query(`
      INSERT INTO users (name,email,password,role,phone,is_verified,city)
      VALUES ('Sara Malik','sara@manager.com',$1,'manager','+92-321-2222222',true,'Lahore')
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [managerPass]);

    const c1 = await client.query(`
      INSERT INTO users (name,email,password,role,phone,is_verified,city)
      VALUES ('Ali Raza','ali@customer.com',$1,'customer','+92-331-4444444',true,'Lahore')
      ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id`, [custPass]);

    const m1Id = m1.rows[0]?.id || (await client.query("SELECT id FROM users WHERE email='ahmed@manager.com'")).rows[0].id;
    const m2Id = m2.rows[0]?.id || (await client.query("SELECT id FROM users WHERE email='sara@manager.com'")).rows[0].id;
    const c1Id = c1.rows[0]?.id || (await client.query("SELECT id FROM users WHERE email='ali@customer.com'")).rows[0].id;

    console.log('Users created');

    // ── REAL LAHORE HALLS ──────────────────────────────────────────────────
    const halls = [
      {
        manager_id: m1Id,
        name: 'Royal Palm Golf & Country Club',
        description: 'One of Lahore\'s most prestigious banquet venues located in the heart of the city. Royal Palm offers a breathtaking setting for weddings and corporate events with lush green surroundings, world-class facilities, and impeccable service. The grand ballroom accommodates up to 1000 guests with elegant decor and state-of-the-art sound and lighting systems.',
        address: 'Canal Bank Road, Thokar Niaz Baig',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 200,
        capacity_max: 1000,
        price_per_day: 350000,
        price_per_hour: 45000,
        hall_type: 'wedding',
        parking_capacity: 300,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.9, total_reviews: 87, total_bookings: 142,
        cover_image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80'
      },
      {
        manager_id: m1Id,
        name: 'Monal Lahore Banquet Hall',
        description: 'Nestled on the scenic Lahore Canal, Monal Banquet Hall offers a perfect blend of natural beauty and luxury. With its stunning outdoor terrace overlooking the canal and a beautifully designed indoor hall, Monal is the preferred choice for elegant weddings and corporate dinners in Lahore.',
        address: 'Canal View, Near Gaddafi Stadium, Gulberg III',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 100,
        capacity_max: 600,
        price_per_day: 220000,
        price_per_hour: 28000,
        hall_type: 'all',
        parking_capacity: 150,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.7, total_reviews: 64, total_bookings: 98,
        cover_image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80'
      },
      {
        manager_id: m2Id,
        name: 'Avari Towers Lahore Grand Ballroom',
        description: 'The iconic Avari Towers in the heart of Lahore hosts one of the city\'s most celebrated grand ballrooms. Offering 5-star hospitality, professional event management, and exquisite in-house catering, the Avari Grand Ballroom has been the venue of choice for high-profile weddings, international conferences, and corporate galas for decades.',
        address: '87 Shahrah-e-Quaid-e-Azam, The Mall Road',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 150,
        capacity_max: 800,
        price_per_day: 450000,
        price_per_hour: 60000,
        hall_type: 'all',
        parking_capacity: 200,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: false,
        avg_rating: 4.8, total_reviews: 112, total_bookings: 198,
        cover_image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1200&q=80'
      },
      {
        manager_id: m2Id,
        name: 'Pearl Continental Lahore Convention Center',
        description: 'Pakistan\'s most celebrated luxury hotel, Pearl Continental Lahore, offers a world-class convention center and banquet facilities. From intimate dinners to grand weddings of 1200 guests, PC Lahore delivers unmatched elegance, professional service, and award-winning culinary excellence that has made it Lahore\'s top choice for premium events.',
        address: 'Shahrah-e-Quaid-e-Azam, Mall Road',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 200,
        capacity_max: 1200,
        price_per_day: 550000,
        price_per_hour: 70000,
        hall_type: 'all',
        parking_capacity: 400,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.9, total_reviews: 156, total_bookings: 274,
        cover_image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
      },
      {
        manager_id: m1Id,
        name: 'Faletti\'s Hotel Banquet Hall',
        description: 'Lahore\'s historic Faletti\'s Hotel, established in 1880, offers a unique blend of colonial architecture and modern luxury. The banquet hall and lawns at Faletti\'s provide a distinctly elegant setting for weddings and corporate functions, combining old-world charm with contemporary comfort in the heart of Lahore.',
        address: 'Egerton Road, Gulberg',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 100,
        capacity_max: 500,
        price_per_day: 280000,
        price_per_hour: 35000,
        hall_type: 'wedding',
        parking_capacity: 120,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: false, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.6, total_reviews: 48, total_bookings: 76,
        cover_image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80'
      },
      {
        manager_id: m2Id,
        name: 'Gulberg Galleria Event Hall',
        description: 'Situated in the upscale Gulberg district, Gulberg Galleria Event Hall is a modern multipurpose venue perfect for corporate launches, product exhibitions, conferences, and private parties. With its contemporary design, flexible layout, and premium AV facilities, it is the go-to choice for business events in Lahore.',
        address: 'Main Boulevard Gulberg, Lahore',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 50,
        capacity_max: 350,
        price_per_day: 180000,
        price_per_hour: 22000,
        hall_type: 'corporate',
        parking_capacity: 100,
        is_ac: true, has_kitchen: false, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: false, catering_available: true, outdoor_space: false,
        avg_rating: 4.5, total_reviews: 35, total_bookings: 61,
        cover_image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80'
      },
      {
        manager_id: m1Id,
        name: 'DHA Garden Party Lawn Lahore',
        description: 'A beautifully landscaped garden venue in the prestigious DHA Phase 5, perfect for open-air weddings, mehndi ceremonies, birthday parties, and garden parties. Featuring fairy lights, floral arches, and a dedicated catering area, DHA Garden Party Lawn creates magical memories under the Lahore sky.',
        address: 'DHA Phase 5, Block L, Lahore',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 100,
        capacity_max: 700,
        price_per_day: 200000,
        price_per_hour: 25000,
        hall_type: 'party',
        parking_capacity: 180,
        is_ac: false, has_kitchen: true, has_stage: true,
        has_projector: false, has_sound_system: true, has_wifi: false,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.7, total_reviews: 59, total_bookings: 104,
        cover_image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80'
      },
      {
        manager_id: m2Id,
        name: 'Lahore Expo Centre Banquet Hall',
        description: 'The Lahore Expo Centre, one of Pakistan\'s largest exhibition and convention centers, offers premium banquet halls for mega events, trade exhibitions, conferences, and large-scale weddings. With capacity for up to 2000 guests, state-of-the-art facilities, and easy accessibility from all parts of Lahore, it is the ultimate venue for landmark events.',
        address: 'Johar Town, Near Canal Road',
        city: 'Lahore',
        state: 'Punjab',
        capacity_min: 300,
        capacity_max: 2000,
        price_per_day: 650000,
        price_per_hour: 85000,
        hall_type: 'all',
        parking_capacity: 600,
        is_ac: true, has_kitchen: true, has_stage: true,
        has_projector: true, has_sound_system: true, has_wifi: true,
        has_decoration: true, catering_available: true, outdoor_space: true,
        avg_rating: 4.8, total_reviews: 93, total_bookings: 167,
        cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'
      },
    ];

    const hallIds = [];
    for (const h of halls) {
      const r = await client.query(`
        INSERT INTO halls (
          manager_id,name,description,address,city,state,
          capacity_min,capacity_max,price_per_day,price_per_hour,
          hall_type,parking_capacity,is_ac,has_kitchen,has_stage,
          has_projector,has_sound_system,has_wifi,has_decoration,
          catering_available,outdoor_space,is_approved,
          avg_rating,total_reviews,total_bookings,cover_image
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
          $16,$17,$18,$19,$20,$21,true,$22,$23,$24,$25
        ) RETURNING id`,
        [h.manager_id,h.name,h.description,h.address,h.city,h.state,
         h.capacity_min,h.capacity_max,h.price_per_day,h.price_per_hour,
         h.hall_type,h.parking_capacity,h.is_ac,h.has_kitchen,h.has_stage,
         h.has_projector,h.has_sound_system,h.has_wifi,h.has_decoration,
         h.catering_available,h.outdoor_space,h.avg_rating,h.total_reviews,
         h.total_bookings,h.cover_image]
      );
      hallIds.push(r.rows[0].id);
    }
    console.log(`${hallIds.length} halls created`);

    // ── HALL IMAGES ───────────────────────────────────────────────────────
    const imagesets = [
      [
        'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=1200&q=80',
        'https://images.unsplash.com/photo-1543674892-7d64d45df18b?w=1200&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80',
        'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200&q=80',
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=1200&q=80',
        'https://images.unsplash.com/photo-1587271407850-8d438ca9fdf2?w=1200&q=80',
        'https://images.unsplash.com/photo-1559564484-1b7e79e38440?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
        'https://images.unsplash.com/photo-1560439513-74b037a25d84?w=1200&q=80',
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80',
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
        'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80',
        'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=1200&q=80',
        'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&q=80',
        'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?w=1200&q=80',
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80',
      ],
      [
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80',
        'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80',
        'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&q=80',
      ],
    ];

    for (let i = 0; i < hallIds.length; i++) {
      for (let j = 0; j < imagesets[i].length; j++) {
        await client.query(
          `INSERT INTO hall_images (hall_id,image_url,is_primary) VALUES ($1,$2,$3)`,
          [hallIds[i], imagesets[i][j], j === 0]
        );
      }
    }
    console.log('Hall images added');

    // ── SAMPLE BOOKING ────────────────────────────────────────────────────
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await client.query(`
      INSERT INTO bookings (
        customer_id,hall_id,event_type,event_date,start_time,end_time,
        guest_count,total_amount,advance_payment,remaining_payment,
        payment_status,booking_status,special_requests
      ) VALUES ($1,$2,'Wedding',$3,'18:00','23:00',300,350000,87500,262500,'partial','confirmed',
        'Please arrange floral stage decoration in white and gold theme. Need halal catering only.')`,
      [c1Id, hallIds[0], futureDateStr]
    );

    await client.query(`
      INSERT INTO bookings (
        customer_id,hall_id,event_type,event_date,start_time,end_time,
        guest_count,total_amount,advance_payment,remaining_payment,
        payment_status,booking_status,special_requests
      ) VALUES ($1,$2,'Corporate Conference','2025-01-15','09:00','17:00',200,180000,180000,0,'paid','completed',
        'Need projector, whiteboard, and coffee breaks every 2 hours.')`,
      [c1Id, hallIds[5], ]
    );
    console.log('Sample bookings added');

    // ── SAMPLE REVIEW ─────────────────────────────────────────────────────
    const booking2 = await client.query(`SELECT id FROM bookings WHERE booking_status='completed' LIMIT 1`);
    if (booking2.rows[0]) {
      await client.query(`
        INSERT INTO reviews (booking_id,customer_id,hall_id,rating,cleanliness_rating,service_rating,value_rating,comment)
        VALUES ($1,$2,$3,5,5,5,4,
          'Absolutely wonderful experience! The hall was immaculate, staff were extremely professional, and the food quality was exceptional. Highly recommend Gulberg Galleria for any corporate event in Lahore!')`,
        [booking2.rows[0].id, c1Id, hallIds[5]]
      );
    }
    console.log('Review added');

    // ── VENDORS ───────────────────────────────────────────────────────────
    const vendors = [
      {
        user_id: c1Id,
        business_name: 'Zafran Catering Services',
        vendor_type: 'catering',
        description: 'Lahore\'s most trusted catering company with over 15 years of experience. Specializing in traditional Pakistani cuisine, continental buffets, and live BBQ setups. We have catered for over 500 weddings and corporate events across Lahore.',
        price_per_event: 80000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&q=80'
      },
      {
        user_id: m1Id,
        business_name: 'Dream Decor Lahore',
        vendor_type: 'decoration',
        description: 'Premier decoration service in Lahore specializing in wedding stages, floral arrangements, fairy light setups, and themed party decorations. Our team of 20 experienced decorators transforms any venue into a magical space.',
        price_per_event: 60000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80'
      },
      {
        user_id: m2Id,
        business_name: 'Lens & Frame Photography',
        vendor_type: 'photography',
        description: 'Award-winning wedding and event photography studio based in Lahore. We offer cinematic videography, drone coverage, photo booths, and same-day edits. Featured in Pakistan\'s top wedding magazines.',
        price_per_event: 75000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80'
      },
      {
        user_id: c1Id,
        business_name: 'Sound Wave DJ & Entertainment',
        vendor_type: 'music',
        description: 'Lahore\'s top DJ and live entertainment provider. Services include professional DJ sets, qawwali nights, live band performances, and complete sound system rental with technical crew for weddings and events.',
        price_per_event: 45000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1571266028243-d220c6a7d1bf?w=800&q=80'
      },
      {
        user_id: m1Id,
        business_name: 'The Cake Studio Lahore',
        vendor_type: 'cake',
        description: 'Custom wedding cakes and dessert tables by Lahore\'s finest pastry chefs. Specializing in multi-tier wedding cakes, cupcake towers, macaron walls, and traditional mithai displays for all events.',
        price_per_event: 25000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80'
      },
      {
        user_id: m2Id,
        business_name: 'Gulshan Florist & Events',
        vendor_type: 'flowers',
        description: 'Fresh flower arrangements, bridal bouquets, stage garlands, and complete venue floral decoration by Lahore\'s most beloved florist. Over 20 years of beautifying weddings and events across Punjab.',
        price_per_event: 35000,
        city: 'Lahore',
        is_approved: true,
        cover_image: 'https://images.unsplash.com/photo-1487530811015-780be8ea0b84?w=800&q=80'
      },
    ];

    for (const v of vendors) {
      await client.query(`
        INSERT INTO vendors (user_id,business_name,vendor_type,description,price_per_event,city,is_approved,cover_image,avg_rating,total_reviews)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,4.7,12)
        ON CONFLICT DO NOTHING`,
        [v.user_id, v.business_name, v.vendor_type, v.description, v.price_per_event, v.city, v.is_approved, v.cover_image]
      );
    }
    console.log('Vendors added');

    // ── NOTIFICATIONS ─────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO notifications (user_id,title,message,type)
      VALUES ($1,'Welcome to BookMyBanquets!','Your account has been created successfully. Start exploring premium banquet halls in Lahore.','success')`,
      [c1Id]
    );

    await client.query('COMMIT');

    console.log('\n========================================');
    console.log('  Database seeded successfully!');
    console.log('========================================');
    console.log('\n  Demo Login Credentials:');
    console.log('');
    console.log('  Admin:');
    console.log('    Email:    admin@bookmybanquets.com');
    console.log('    Password: Admin@123');
    console.log('');
    console.log('  Manager:');
    console.log('    Email:    ahmed@manager.com');
    console.log('    Password: Manager@123');
    console.log('');
    console.log('  Customer:');
    console.log('    Email:    ali@customer.com');
    console.log('    Password: Customer@123');
    console.log('');
    console.log('  8 real Lahore banquet halls added!');
    console.log('  6 vendors added!');
    console.log('========================================\n');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
};

seedDatabase();
