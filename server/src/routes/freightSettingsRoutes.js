const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protectAdmin } = require('../middleware/authMiddleware');

// GET all items in a category
router.get('/:category', protectAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM freight_settings WHERE category=? ORDER BY name ASC', [req.params.category]);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// POST create item
router.post('/:category', protectAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await pool.query('INSERT INTO freight_settings (category, name) VALUES (?,?)', [req.params.category, name]);
    res.status(201).json({ id: result.insertId, name, is_active: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// PUT update item
router.put('/:category/:id', protectAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE freight_settings SET name=?, updated_at=NOW() WHERE id=? AND category=?', [name, req.params.id, req.params.category]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

// PATCH toggle active
router.patch('/:category/:id/toggle', protectAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT is_active FROM freight_settings WHERE id=?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    await pool.query('UPDATE freight_settings SET is_active=?, updated_at=NOW() WHERE id=?', [!rows[0].is_active, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: 'Error' }); }
});

module.exports = router;
