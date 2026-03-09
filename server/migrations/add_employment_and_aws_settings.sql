-- Create employment_applications table
CREATE TABLE IF NOT EXISTS employment_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('Male', 'Female') NOT NULL,
  nationality VARCHAR(100),
  current_location VARCHAR(255),
  qualification VARCHAR(255) NOT NULL,
  experience_years INT,
  current_company VARCHAR(255),
  position_applied VARCHAR(255) NOT NULL,
  expected_salary VARCHAR(100),
  notice_period VARCHAR(100),
  skills TEXT,
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  resume_url VARCHAR(500),
  cover_letter TEXT,
  disability ENUM('Yes', 'No') DEFAULT 'No',
  disability_type VARCHAR(255),
  stage ENUM('Applied', 'Screening', 'Interview', 'Offer', 'Accepted', 'Rejected', 'Onboarding') DEFAULT 'Applied',
  interview_date DATETIME,
  interview_time VARCHAR(50),
  interview_venue TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_stage (stage),
  INDEX idx_position (position_applied),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create aws_settings table for storing AWS SES credentials
CREATE TABLE IF NOT EXISTS aws_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  is_encrypted BOOLEAN DEFAULT FALSE,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default AWS settings (empty values to be filled from admin panel)
INSERT INTO aws_settings (setting_key, setting_value, is_encrypted) VALUES
('AWS_ACCESS_KEY_ID', '', FALSE),
('AWS_SECRET_ACCESS_KEY', '', TRUE),
('AWS_REGION', 'eu-north-1', FALSE),
('AWS_SES_FROM_EMAIL', 'info@gvs-bh.com', FALSE),
('AWS_SES_FROM_NAME', 'Global Vision Solutions', FALSE)
ON DUPLICATE KEY UPDATE setting_key = setting_key;
