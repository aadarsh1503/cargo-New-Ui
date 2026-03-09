const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const {
    getAllSettings,
    getSettingByKey,
    updateSetting
} = require('../controllers/settingsController');

// Public route
router.get('/:key', getSettingByKey);

// Admin routes
router.get('/', protectAdmin, getAllSettings);
router.put('/:key', protectAdmin, updateSetting);

module.exports = router;
