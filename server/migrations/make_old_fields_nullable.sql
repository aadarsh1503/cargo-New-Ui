-- Make old employment fields nullable since we're now using internship fields
ALTER TABLE employment_applications 
MODIFY COLUMN position_applied VARCHAR(255) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN experience_years INT NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN current_company VARCHAR(255) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN expected_salary VARCHAR(100) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN notice_period VARCHAR(100) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN skills TEXT NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN linkedin_url VARCHAR(500) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN portfolio_url VARCHAR(500) NULL;

ALTER TABLE employment_applications 
MODIFY COLUMN cover_letter TEXT NULL;
