-- Add SMTP settings and email provider selector to aws_settings table
INSERT INTO aws_settings (setting_key, setting_value, is_encrypted) VALUES
('EMAIL_PROVIDER', 'smtp', FALSE),
('SMTP_HOST', '', FALSE),
('SMTP_PORT', '465', FALSE),
('SMTP_SECURE', 'true', FALSE),
('SMTP_USER', '', FALSE),
('SMTP_PASS', '', TRUE),
('SMTP_FROM_EMAIL', '', FALSE),
('SMTP_FROM_NAME', 'GVS Cargo', FALSE)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
