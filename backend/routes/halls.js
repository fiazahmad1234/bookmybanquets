const express = require('express');
const router = express.Router();
const halls = require('../controllers/hallController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', halls.getHalls);
router.get('/cities', halls.getCities);
router.get('/compare', halls.compareHalls);
router.get('/recommendations', halls.getAIRecommendations);
router.get('/my-halls', protect, authorize('manager'), halls.getManagerHalls);
router.post('/', protect, authorize('manager', 'admin'), upload.single('cover_image'), halls.createHall);
router.get('/:id', halls.getHall);
router.put('/:id', protect, authorize('manager', 'admin'), upload.single('cover_image'), halls.updateHall);
router.delete('/:id', protect, authorize('manager', 'admin'), halls.deleteHall);
router.get('/:id/availability', halls.checkAvailability);
router.get('/:id/calendar', halls.getHallCalendar);
router.put('/:id/approve', protect, authorize('admin'), halls.approveHall);

module.exports = router;
