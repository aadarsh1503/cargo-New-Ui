const express = require('express');
const router = express.Router();
const { loginAdmin , registerAdmin  } = require('../controllers/adminController');

// Route for admin login
router.post('/login', loginAdmin);
router.post('/initiate-admin-creation', registerAdmin);
module.exports = router;