const express = require('express');
const router = express.Router();
const {
  getAWSSettings,
  updateAWSSettings,
  testAWSConnection
} = require('../controllers/awsSettingsController');
const { protectAdmin } = require('../middleware/authMiddleware');

// All routes are protected (admin only)
router.get('/', protectAdmin, getAWSSettings);
router.put('/', protectAdmin, updateAWSSettings);
router.post('/test', protectAdmin, testAWSConnection);

module.exports = router;
