-- Update employment_applications table to match internship fields
-- Add new columns (will error if they exist, but that's okay)
ALTER TABLE employment_applications 
ADD COLUMN university VARCHAR(255) AFTER qualification;

ALTER TABLE employment_applications 
ADD COLUMN department VARCHAR(100) AFTER university;

ALTER TABLE employment_applications 
ADD COLUMN internship_coordinator VARCHAR(255) AFTER department;

ALTER TABLE employment_applications 
ADD COLUMN hours INT AFTER internship_coordinator;

ALTER TABLE employment_applications 
ADD COLUMN joining_date DATE AFTER hours;
