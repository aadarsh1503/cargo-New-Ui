const pool = require('../config/db');
const { invalidateCache } = require('../../utils/emailProvider');

const ALL_KEYS = [
  'EMAIL_PROVIDER',
  // AWS SES
  'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION',
  'AWS_SES_FROM_EMAIL', 'AWS_SES_FROM_NAME',
  // SMTP
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_SECURE',
  'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM_EMAIL', 'SMTP_FROM_NAME',
];

// Get all email settings
exports.getAWSSettings = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM aws_settings');
    const data = {};
    rows.forEach(r => { data[r.setting_key] = r.setting_value; });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings', error: e.message });
  }
};

// Update settings (accepts any subset of ALL_KEYS)
exports.updateAWSSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings format' });
    }
    for (const [key, value] of Object.entries(settings)) {
      if (!ALL_KEYS.includes(key)) continue;
      // Upsert — insert if missing, update if exists
      await pool.query(
        `INSERT INTO aws_settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value]
      );
    }
    invalidateCache(); // force re-read on next email send
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save settings', error: e.message });
  }
};

// Test the currently active provider
exports.testAWSConnection = async (req, res) => {
  try {
    const { sendMail, getSettings } = require('../../utils/emailProvider');
    const cfg = await getSettings();
    const provider = cfg?.EMAIL_PROVIDER || 'smtp';
    const toEmail = provider === 'aws' ? cfg.AWS_SES_FROM_EMAIL : (cfg?.SMTP_FROM_EMAIL || process.env.EMAIL_FROM);

    await sendMail({
      to: toEmail,
      subject: `GVS Email Test — ${provider.toUpperCase()}`,
      html: `<p>This is a test email from GVS Admin Panel using <strong>${provider.toUpperCase()}</strong>. Your email configuration is working correctly!</p>`,
    });

    res.json({ success: true, message: `Test email sent via ${provider.toUpperCase()} to ${toEmail}` });
  } catch (e) {
    console.error('Test email error:', e);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: e.message });
  }
};
