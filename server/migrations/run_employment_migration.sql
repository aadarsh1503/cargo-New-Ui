-- Simple migration script to add all new fields to employment_applications table
-- Run this if you have existing data and want to keep it

-- Step 1: Backup your data first! (Run this in your MySQL client)
-- CREATE TABLE employment_applications_backup AS SELECT * FROM employment_applications;

-- Step 2: Add all new columns
ALTER TABLE employment_applications 
  ADD COLUMN fullName VARCHAR(255) AFTER id,
  ADD COLUMN dateOfBirth DATE AFTER fullName,
  ADD COLUMN mobileContact VARCHAR(20) AFTER nationality,
  ADD COLUMN whatsapp VARCHAR(20) AFTER mobileContact,
  ADD COLUMN currentAddress TEXT AFTER whatsapp,
  ADD COLUMN postalCode VARCHAR(20) AFTER currentAddress,
  ADD COLUMN city VARCHAR(100) AFTER postalCode,
  ADD COLUMN country VARCHAR(100) AFTER city,
  ADD COLUMN cprNationalId VARCHAR(50) AFTER country,
  ADD COLUMN passportId VARCHAR(50) AFTER cprNationalId,
  ADD COLUMN passportValidity DATE AFTER passportId,
  ADD COLUMN educationLevel VARCHAR(100) AFTER passportValidity,
  ADD COLUMN courseDegree VARCHAR(255) AFTER educationLevel,
  ADD COLUMN currentlyEmployed ENUM('Yes', 'No') AFTER courseDegree,
  ADD COLUMN employmentDesired VARCHAR(255) AFTER currentlyEmployed,
  ADD COLUMN yearsOfExperience INT AFTER employmentDesired,
  ADD COLUMN availableStart DATE AFTER yearsOfExperience,
  ADD COLUMN shiftAvailable ENUM('Day', 'Night', 'Both') AFTER availableStart,
  ADD COLUMN canTravel ENUM('Yes', 'No') AFTER shiftAvailable,
  ADD COLUMN drivingLicense ENUM('Yes', 'No') AFTER canTravel,
  ADD COLUMN skills TEXT AFTER drivingLicense,
  ADD COLUMN ref1Name VARCHAR(255) AFTER skills,
  ADD COLUMN ref1Contact VARCHAR(20) AFTER ref1Name,
  ADD COLUMN ref1Email VARCHAR(255) AFTER ref1Contact,
  ADD COLUMN ref2Name VARCHAR(255) AFTER ref1Email,
  ADD COLUMN ref2Contact VARCHAR(20) AFTER ref2Name,
  ADD COLUMN ref2Email VARCHAR(255) AFTER ref2Contact,
  ADD COLUMN ref3Name VARCHAR(255) AFTER ref2Email,
  ADD COLUMN ref3Contact VARCHAR(20) AFTER ref3Name,
  ADD COLUMN ref3Email VARCHAR(255) AFTER ref3Contact,
  ADD COLUMN visaStatus VARCHAR(50) AFTER ref3Email,
  ADD COLUMN visaValidity DATE AFTER visaStatus,
  ADD COLUMN expectedSalary DECIMAL(10, 2) AFTER visaValidity,
  ADD COLUMN clientLeadsStrategy TEXT AFTER expectedSalary;

-- Step 3: Modify gender column to include 'Other' option
ALTER TABLE employment_applications 
  MODIFY COLUMN gender ENUM('Male', 'Female', 'Other');

-- Step 4: Add indexes for better performance
ALTER TABLE employment_applications 
  ADD INDEX idx_email (email),
  ADD INDEX idx_fullName (fullName),
  ADD INDEX idx_stage (stage),
  ADD INDEX idx_created_at (created_at);

-- Done! Your table is now updated with all the new fields.
