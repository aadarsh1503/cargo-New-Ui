const express = require('express');
const router = express.Router();
const {
    getAllRegions,
    getContentByRegionCode,
    createRegionWithContent,
    updateContentByRegionCode,
    deleteRegionByCode
} = require('../controllers/contentController');
const { protectAdmin } = require('../middleware/authMiddleware');

// --- Public Routes ---
// These routes are accessible to anyone.
router.get('/regions', getAllRegions);
router.get('/content/:regionCode', getContentByRegionCode);




router.post('/regions', protectAdmin, createRegionWithContent);


router.put('/content/:regionCode', protectAdmin, updateContentByRegionCode);


router.delete('/regions/:regionCode', protectAdmin, deleteRegionByCode); 

module.exports = router;