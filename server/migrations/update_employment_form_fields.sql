-- Migration to update employment_applications table with all new fields
-- This adds all fields from the reference form including references

-- Drop the old table if you want a fresh start (CAUTION: This will delete all data!)
-- DROP TABLE IF EXISTS employment_applications;

-- Create new employment_applications table with all fields
CREATE TABLE IF NOT EXISTS employment_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Personal Information
  email VARCHAR(255) NOT NULL,
  fullName VARCHAR(255) NOT NULL,
  dateOfBirth DATE NOT NULL,
  gender ENUM('Male', 'Female', 'Other') NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  mobileContact VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  currentAddress TEXT NOT NULL,
  postalCode VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  cprNationalId VARCHAR(50),
  passportId VARCHAR(50),
  passportValidity DATE,
  
  -- Education and Work
  educationLevel VARCHAR(100) NOT NULL,
  courseDegree VARCHAR(255) NOT NULL,
  currentlyEmployed ENUM('Yes', 'No') NOT NULL,
  employmentDesired VARCHAR(255) NOT NULL,
  yearsOfExperience VARCHAR(50),
  availableStart VARCHAR(100) NOT NULL,
  shiftAvailable VARCHAR(50) NOT NULL,
  canTravel ENUM('Yes', 'No') NOT NULL,
  drivingLicense ENUM('Yes', 'No') NOT NULL,
  skills TEXT NOT NULL,
  
  -- References (3 references)
  ref1Name VARCHAR(255),
  ref1Contact VARCHAR(20),
  ref1Email VARCHAR(255),
  ref2Name VARCHAR(255),
  ref2Contact VARCHAR(20),
  ref2Email VARCHAR(255),
  ref3Name VARCHAR(255),
  ref3Contact VARCHAR(20),
  ref3Email VARCHAR(255),
  
  -- Additional Information
  visaStatus VARCHAR(50),
  visaValidity DATE,
  expectedSalary DECIMAL(10, 2) NOT NULL,
  clientLeadsStrategy TEXT NOT NULL,
  
  -- File Upload
  resume_url TEXT,
  
  -- Application Status
  stage ENUM('Applied', 'Interview', 'Accepted', 'Rejected', 'Completion', 'Certification') DEFAULT 'Applied',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_stage (stage),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- If you want to migrate existing data, use ALTER TABLE instead:
-- WARNING: Run these one by one and check your existing table structure first!

/*
-- Add new columns to existing table
ALTER TABLE employment_applications 
  ADD COLUMN IF NOT EXISTS fullName VARCHAR(255) AFTER id,
  ADD COLUMN IF NOT EXISTS dateOfBirth DATE AFTER fullName,
  ADD COLUMN IF NOT EXISTS mobileContact VARCHAR(20) AFTER nationality,
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(20) AFTER mobileContact,
  ADD COLUMN IF NOT EXISTS currentAddress TEXT AFTER whatsapp,
  ADD COLUMN IF NOT EXISTS postalCode VARCHAR(20) AFTER currentAddress,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER postalCode,
  ADD COLUMN IF NOT EXISTS country VARCHAR(100) AFTER city,
  ADD COLUMN IF NOT EXISTS cprNationalId VARCHAR(50) AFTER country,
  ADD COLUMN IF NOT EXISTS passportId VARCHAR(50) AFTER cprNationalId,
  ADD COLUMN IF NOT EXISTS passportValidity DATE AFTER passportId,
  ADD COLUMN IF NOT EXISTS educationLevel VARCHAR(100) AFTER passportValidity,
  ADD COLUMN IF NOT EXISTS courseDegree VARCHAR(255) AFTER educationLevel,
  ADD COLUMN IF NOT EXISTS currentlyEmployed ENUM('Yes', 'No') AFTER courseDegree,
  ADD COLUMN IF NOT EXISTS employmentDesired VARCHAR(255) AFTER currentlyEmployed,
  ADD COLUMN IF NOT EXISTS yearsOfExperience INT AFTER employmentDesired,
  ADD COLUMN IF NOT EXISTS availableStart DATE AFTER yearsOfExperience,
  ADD COLUMN IF NOT EXISTS shiftAvailable ENUM('Day', 'Night', 'Both') AFTER availableStart,
  ADD COLUMN IF NOT EXISTS canTravel ENUM('Yes', 'No') AFTER shiftAvailable,
  ADD COLUMN IF NOT EXISTS drivingLicense ENUM('Yes', 'No') AFTER canTravel,
  ADD COLUMN IF NOT EXISTS skills TEXT AFTER drivingLicense,
  ADD COLUMN IF NOT EXISTS ref1Name VARCHAR(255) AFTER skills,
  ADD COLUMN IF NOT EXISTS ref1Contact VARCHAR(20) AFTER ref1Name,
  ADD COLUMN IF NOT EXISTS ref1Email VARCHAR(255) AFTER ref1Contact,
  ADD COLUMN IF NOT EXISTS ref2Name VARCHAR(255) AFTER ref1Email,
  ADD COLUMN IF NOT EXISTS ref2Contact VARCHAR(20) AFTER ref2Name,
  ADD COLUMN IF NOT EXISTS ref2Email VARCHAR(255) AFTER ref2Contact,
  ADD COLUMN IF NOT EXISTS ref3Name VARCHAR(255) AFTER ref2Email,
  ADD COLUMN IF NOT EXISTS ref3Contact VARCHAR(20) AFTER ref3Name,
  ADD COLUMN IF NOT EXISTS ref3Email VARCHAR(255) AFTER ref3Contact,
  ADD COLUMN IF NOT EXISTS visaStatus VARCHAR(50) AFTER ref3Email,
  ADD COLUMN IF NOT EXISTS visaValidity DATE AFTER visaStatus,
  ADD COLUMN IF NOT EXISTS expectedSalary DECIMAL(10, 2) AFTER visaValidity,
  ADD COLUMN IF NOT EXISTS clientLeadsStrategy TEXT AFTER expectedSalary;

-- Modify existing columns if needed
ALTER TABLE employment_applications 
  MODIFY COLUMN gender ENUM('Male', 'Female', 'Other');

-- Add indexes for better performance
ALTER TABLE employment_applications 
  ADD INDEX IF NOT EXISTS idx_email (email),
  ADD INDEX IF NOT EXISTS idx_stage (stage),
  ADD INDEX IF NOT EXISTS idx_created_at (created_at);
*/
