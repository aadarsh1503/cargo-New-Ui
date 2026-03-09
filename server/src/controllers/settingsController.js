const pool = require('../config/db');

// Get all settings (admin)
const getAllSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
};

// Get specific setting by key (public)
const getSettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Setting not found' });
        }

        res.json({ value: rows[0].setting_value });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ message: 'Error fetching setting' });
    }
};

// Update setting
const updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        const [result] = await pool.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
            [value, key]
        );

        if (result.affectedRows === 0) {
            // If setting doesn't exist, create it
            await pool.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        }

        res.json({ message: 'Setting updated successfully' });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ message: 'Error updating setting' });
    }
};

module.exports = {
    getAllSettings,
    getSettingByKey,
    updateSetting
};
