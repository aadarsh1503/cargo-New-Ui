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

// Combined: all active locations in one query (used by Map component)
router.get('/locations/all', async (req, res) => {
  try {
    const [rows] = await require('../config/db').query(`
      SELECT rc.*, r.name, r.code, r.country_flag
      FROM region_content rc
      JOIN regions r ON rc.region_id = r.id
      WHERE r.is_active = 1
      ORDER BY r.name
    `);
    const locations = rows.map(dbContent => {
      const regionName = dbContent.name;
      if (dbContent.address && typeof dbContent.address === 'string') {
        try { dbContent.address = JSON.parse(dbContent.address); } catch { dbContent.address = [dbContent.address]; }
      }
      return {
        ...dbContent,
        welcome_message: `Welcome to GVS Cargo - ${regionName}!`,
        local_modal_title: `Our Location in ${regionName}`,
      };
    });
    res.json(locations);
  } catch (error) {
    console.error('Error fetching all locations:', error);
    res.status(500).json({ message: 'Error fetching locations' });
  }
});




router.post('/regions', protectAdmin, createRegionWithContent);


router.put('/content/:regionCode', protectAdmin, updateContentByRegionCode);


router.delete('/regions/:regionCode', protectAdmin, deleteRegionByCode); 

module.exports = router;