const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversations, getMessages, sendMessage } = require('../controllers/notificationController');

router.get('/conversations', protect, getConversations);
router.get('/:other_user_id', protect, getMessages);
router.post('/', protect, sendMessage);

module.exports = router;
