const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/halls', require('./routes/halls'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BookMyBanquets API is running! 🚀', timestamp: new Date() });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// ==================== SOCKET.IO REAL-TIME CHAT ====================
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.join(`user_${userId}`);
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} joined`);
  });

  // Send private message
  socket.on('send_message', async (data) => {
    const { sender_id, receiver_id, message, booking_id, hall_id } = data;
    try {
      const pool = require('./config/database');
      const result = await pool.query(`
        INSERT INTO messages (sender_id, receiver_id, message, booking_id, hall_id)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [sender_id, receiver_id, message, booking_id, hall_id]);

      const savedMessage = result.rows[0];

      // Emit to receiver
      io.to(`user_${receiver_id}`).emit('new_message', savedMessage);
      // Emit back to sender for confirmation
      socket.emit('message_sent', savedMessage);

      // Create notification
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, reference_id, reference_type)
        VALUES ($1, 'New Message', $2, 'message', $3, 'message')
      `, [receiver_id, `You have a new message`, sender_id]);

      io.to(`user_${receiver_id}`).emit('notification', {
        type: 'message',
        message: 'You have a new message'
      });
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  // Typing indicator
  socket.on('typing', ({ sender_id, receiver_id, isTyping }) => {
    io.to(`user_${receiver_id}`).emit('user_typing', { sender_id, isTyping });
  });

  // Mark messages as read
  socket.on('mark_read', async ({ sender_id, receiver_id }) => {
    try {
      const pool = require('./config/database');
      await pool.query(
        'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2',
        [sender_id, receiver_id]
      );
      io.to(`user_${sender_id}`).emit('messages_read', { by: receiver_id });
    } catch (err) { console.error('Mark read error:', err); }
  });

  // Booking notification
  socket.on('booking_update', (data) => {
    io.to(`user_${data.customer_id}`).emit('booking_notification', data);
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online_users', Array.from(onlineUsers.keys()));
    console.log('🔌 Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🏛️  BookMyBanquets API Server        ║
  ║     Running on port ${PORT}                  ║
  ║     Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
