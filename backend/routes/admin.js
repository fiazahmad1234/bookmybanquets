const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const admin = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/dashboard', admin.getDashboardStats);
router.get('/users', admin.getAllUsers);
router.put('/users/:id/toggle', admin.toggleUserStatus);
router.get('/halls/pending', admin.getPendingHalls);
router.get('/vendors/pending', admin.getPendingVendors);
router.put('/vendors/:id/approve', admin.approveVendor);

module.exports = router;
