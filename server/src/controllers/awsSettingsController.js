const pool = require('../config/db');

// Get AWS settings (Admin)
exports.getAWSSettings = async (req, res) => {
  try {
    const [settings] = await pool.query('SELECT setting_key, setting_value FROM aws_settings');
    
    const settingsObj = {};
    settings.forEach(setting => {
      // Return actual values without masking
      settingsObj[setting.setting_key] = setting.setting_value;
    });

    res.status(200).json({
      success: true,
      data: settingsObj
    });

  } catch (error) {
    console.error('Error fetching AWS settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch AWS settings',
      error: error.message
    });
  }
};

// Update AWS settings (Admin)
exports.updateAWSSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid settings format'
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'UPDATE aws_settings SET setting_value = ? WHERE setting_key = ?',
        [value, key]
      );
    }

    res.status(200).json({
      success: true,
      message: 'AWS settings updated successfully'
    });

  } catch (error) {
    console.error('Error updating AWS settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update AWS settings',
      error: error.message
    });
  }
};

// Test AWS SES connection (Admin)
exports.testAWSConnection = async (req, res) => {
  try {
    const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
    
    // Get AWS settings from database
    const [settings] = await pool.query('SELECT setting_key, setting_value FROM aws_settings');
    const config = {};
    settings.forEach(setting => {
      config[setting.setting_key] = setting.setting_value;
    });

    // Create SES client
    const sesClient = new SESClient({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY
      }
    });

    // Send test email
    const params = {
      Source: `${config.AWS_SES_FROM_NAME} <${config.AWS_SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: [config.AWS_SES_FROM_EMAIL]
      },
      Message: {
        Subject: {
          Data: 'AWS SES Test Email - GVS',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: '<p>This is a test email from GVS Admin Panel. Your AWS SES configuration is working correctly!</p>',
            Charset: 'UTF-8'
          }
        }
      }
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.'
    });

  } catch (error) {
    console.error('Error testing AWS connection:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};
