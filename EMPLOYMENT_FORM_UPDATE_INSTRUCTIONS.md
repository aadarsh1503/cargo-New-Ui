# Employment Form Update - Complete Guide

## What Was Changed

The employment form has been completely updated with all fields from the reference code, including:

### New Fields Added:
1. **Personal Information (Step 1)**
   - Full Name, Email, Date of Birth, Gender
   - Nationality, Mobile Contact, WhatsApp
   - Current Address, City, Country, Postal Code
   - CPR/National ID (optional)
   - Passport ID & Validity (optional)

2. **Education & Work (Step 2)**
   - Education Level, Course/Degree
   - Currently Employed, Employment Desired
   - Years of Experience (optional)
   - Available Start Date
   - Shift Available, Can Travel, Driving License
   - Skills

3. **References (Step 3)** - NEW!
   - Reference 1: Name, Contact, Email
   - Reference 2: Name, Contact, Email
   - Reference 3: Name, Contact, Email
   - Note: If any field is filled for a reference, all fields become required

4. **Additional Info (Step 4)**
   - Visa Status & Validity (optional)
   - Expected Salary (required)
   - Client Leads Strategy (required)
   - Resume Upload (required, max 2MB)

## Files Modified

### Frontend:
- ✅ `client/src/pages/EmploymentForm.jsx` - Complete 4-step form with all fields

### Backend:
- ✅ `server/src/controllers/employmentController.js` - Updated to handle all new fields
- ✅ Uses Cloudinary for file uploads (already configured in your .env)

### Database:
- ✅ `server/migrations/update_employment_form_fields.sql` - Full table schema
- ✅ `server/migrations/run_employment_migration.sql` - Migration script for existing tables

## How to Run the Migration

### Option 1: Fresh Start (No existing data)
```sql
-- Run this in your MySQL client
DROP TABLE IF EXISTS employment_applications;

-- Then run the create table script from:
-- server/migrations/update_employment_form_fields.sql
```

### Option 2: Keep Existing Data (Recommended)
```sql
-- Step 1: Backup first!
CREATE TABLE employment_applications_backup AS SELECT * FROM employment_applications;

-- Step 2: Run the migration
-- Copy and paste the contents of: server/migrations/run_employment_migration.sql
-- into your MySQL client and execute
```

### Using the migration script:
```bash
# From the server directory
cd server
node run-migration.js migrations/run_employment_migration.sql
```

## Testing the Form

1. Start your backend server:
```bash
cd server
npm start
```

2. Start your frontend:
```bash
cd client
npm run dev
```

3. Navigate to the employment form page
4. Fill out all 4 steps
5. Submit and check:
   - Database entry created
   - Confirmation email sent to applicant
   - Notification email sent to admin (info@gvs-bh.com)

## Color Scheme

The form uses your existing blue color scheme:
- Primary: `#0284C7` (Sky Blue)
- Secondary: `#0369A1`
- Tertiary: `#075985`
- Dark: `#0C4A6E`

## API Endpoint

The form submits to:
```
POST /api/employment/submit
```

Make sure your route is configured correctly in `server/src/routes/employmentRoutes.js`

## File Upload

- Uses **Cloudinary** (already configured in your .env)
- Max file size: **2MB**
- Accepted formats: PDF, DOCX, DOC, Images
- Folder: `employment_resumes`

## Email Notifications

Two emails are sent on submission:
1. **Applicant Confirmation** - Sent to the applicant's email
2. **Admin Notification** - Sent to info@gvs-bh.com with all details

## Database Schema

The table now includes 40+ fields organized as:
- Personal info (14 fields)
- Education/Work (10 fields)
- References (9 fields - 3 references × 3 fields each)
- Additional info (4 fields)
- System fields (resume_url, stage, timestamps)

## Validation

### Frontend Validation:
- Step 1: All fields required except CPR, Passport
- Step 2: All fields required except Years of Experience
- Step 3: References optional, but if any field filled, all fields required for that reference
- Step 4: Expected Salary, Client Leads Strategy, and Resume required

### Backend Validation:
- Checks all required fields
- Validates file upload
- Returns appropriate error messages

## Next Steps

1. ✅ Run the SQL migration
2. ✅ Test the form submission
3. ✅ Verify emails are sent
4. ✅ Check admin panel displays new fields
5. ✅ Test file upload to Cloudinary

## Troubleshooting

### If columns already exist:
The migration might fail if some columns already exist. In that case:
1. Check which columns exist: `DESCRIBE employment_applications;`
2. Remove those columns from the migration script
3. Run again

### If file upload fails:
Check your Cloudinary credentials in `.env`:
```
CLOUDINARY_CLOUD_NAME="ds1dt3qub"
CLOUDINARY_API_KEY="812267761956811"
CLOUDINARY_API_SECRET="mSDcT7ojdMLhFUPrbPHtOeL4hqk"
```

### If emails don't send:
Check AWS SES settings in the `aws_settings` table or environment variables.

## Summary

✅ Frontend: Complete 4-step form with all fields and validation
✅ Backend: Updated controller with all field handling
✅ Database: Migration scripts ready to run
✅ File Upload: Configured with Cloudinary
✅ Emails: Confirmation and notification emails
✅ Colors: Maintained your existing blue theme

Everything is ready to go! Just run the migration and test.
