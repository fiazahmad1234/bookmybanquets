// bookings.js
const express = require('express');
const router = express.Router();
const bookings = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, bookings.getBookings);
router.post('/', protect, authorize('customer'), bookings.createBooking);
router.get('/stats', protect, bookings.getBookingStats);
router.get('/:id', protect, bookings.getBooking);
router.put('/:id/status', protect, authorize('manager', 'admin'), bookings.updateBookingStatus);
router.put('/:id/cancel', protect, authorize('customer'), bookings.cancelBooking);

module.exports = router;
