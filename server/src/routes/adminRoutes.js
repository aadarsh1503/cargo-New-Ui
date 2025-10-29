const express = require('express');
const router = express.Router();
const { loginAdmin , registerAdmin, forgotPassword, resetPassword  } = require('../controllers/adminController');

// Route for admin login
router.post('/login', loginAdmin);
router.post('/initiate-admin-creation', registerAdmin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
module.exports = router;