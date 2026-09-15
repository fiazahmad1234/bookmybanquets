const express = require('express');
const router = express.Router();
const reviews = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('customer'), reviews.createReview);
router.get('/hall/:hall_id', reviews.getHallReviews);
router.put('/:id/reply', protect, authorize('manager'), reviews.replyToReview);

module.exports = router;
