// vendors.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getVendors, createVendor } = require('../controllers/vendorController');
const upload = require('../middleware/upload');

router.get('/', getVendors);
router.post('/', protect, upload.single('cover_image'), createVendor);

module.exports = router;
