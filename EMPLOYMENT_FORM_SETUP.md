# Employment Form & AWS Settings Setup

## Overview
This setup includes:
1. Employment application form (public-facing)
2. Admin panel to manage employment applications
3. AWS SES settings management (no need to edit .env)
4. Email notifications via AWS SES

## Database Tables Created
- `employment_applications` - Stores all employment applications
- `aws_settings` - Stores AWS SES credentials (managed from admin panel)

## Routes Added

### Public Routes
- `/careers` - Employment application form
- `/employment-form` - Alternative URL for employment form

### Admin Routes (Protected)
- `/admin/employment` - Manage employment applications
- `/admin/aws-settings` - Configure AWS SES credentials

### API Endpoints

#### Public
- `POST /api/employment/submit` - Submit employment application

#### Admin (Protected)
- `GET /api/employment/applications` - Get all applications
- `PATCH /api/employment/applications/:id/stage` - Update application stage
- `POST /api/employment/applications/send-custom-email` - Send custom email
- `DELETE /api/employment/applications/:id` - Delete application
- `POST /api/employment/applications/bulk-delete` - Delete multiple applications
- `GET /api/employment/export` - Export applications to CSV

#### AWS Settings (Protected)
- `GET /api/aws-settings` - Get AWS settings
- `PUT /api/aws-settings` - Update AWS settings
- `POST /api/aws-settings/test` - Test AWS SES connection

## Features

### Employment Form
- Personal information (name, email, mobile, DOB, gender, nationality, location)
- Professional information (qualification, experience, position, salary expectations)
- Resume upload (PDF/DOCX/Images, max 2MB)
- Skills, LinkedIn, portfolio URL
- Cover letter
- Disability information
- Phone input with country detection
- Success animation on submission
- Email confirmation to applicant
- Email notification to admin

### Admin Panel - Employment Manager
- View all applications in a table
- Filter by stage and position
- Pagination (5, 10, 25, 50 per page)
- Update application stage (Applied, Screening, Interview, Offer, Accepted, Rejected, Onboarding)
- View detailed application information
- Send custom emails to applicants
- WhatsApp integration (click to chat)
- Delete single or multiple applications
- Export to CSV/Excel
- Responsive design

### Admin Panel - AWS Settings
- Configure AWS credentials without editing .env
- Fields:
  - AWS Access Key ID
  - AWS Secret Access Key (encrypted & masked)
  - AWS Region (dropdown)
  - From Email Address
  - From Name
- Test connection button (sends test email)
- Settings stored in database
- Secure password masking

## Application Stages
1. **Applied** - Initial submission
2. **Screening** - Under review
3. **Interview** - Scheduled for interview
4. **Offer** - Offer extended
5. **Accepted** - Offer accepted
6. **Rejected** - Application rejected
7. **Onboarding** - In onboarding process

## Email Notifications

### Automatic Emails
- **On Application Submit**: Confirmation email to applicant + notification to admin
- **On Stage Change**: Can send custom email when changing stage

### Custom Emails
- Subject and message customization
- Optional attachment URL
- Sent to individual applicants

## AWS SES Setup

### Prerequisites
1. AWS Account with SES access
2. Verified sender email in AWS SES
3. IAM user with SES send permissions

### Configuration Steps
1. Login to admin panel
2. Navigate to `/admin/aws-settings`
3. Enter your AWS credentials:
   - Access Key ID
   - Secret Access Key
   - Region (e.g., eu-north-1)
   - From Email (must be verified in SES)
   - From Name
4. Click "Save Settings"
5. Click "Test Connection" to verify

### IAM Permissions Required
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## File Upload Configuration

### Supported Formats
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

### Storage
- PDF/DOCX: ImageKit
- Images: Cloudinary

### Size Limits
- Max file size: 2MB

## Environment Variables Required

### Already in .env (no changes needed)
```env
# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ImageKit (for PDF/DOCX uploads)
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint

# JWT (for admin authentication)
JWT_SECRET=your_jwt_secret
```

### AWS Settings (Managed from Admin Panel)
No need to add AWS credentials to .env anymore! Configure them directly from the admin panel at `/admin/aws-settings`.

## Usage

### For Applicants
1. Visit `/careers` or `/employment-form`
2. Fill out the application form
3. Upload resume
4. Submit
5. Receive confirmation email

### For Admins
1. Login to admin panel
2. Go to `/admin/employment` to view applications
3. Filter, sort, and manage applications
4. Send emails to applicants
5. Export data as needed
6. Configure AWS settings at `/admin/aws-settings`

## Security Features
- Admin routes protected with JWT authentication
- AWS Secret Key encrypted in database
- Sensitive values masked in UI
- File upload validation
- SQL injection prevention
- XSS protection

## Dependencies Added
- `@aws-sdk/client-ses` - AWS SES email sending
- `cloudinary` - Image upload service
- `multer` - File upload handling (already installed)
- `react-phone-input-2` - Phone number input (already installed)

## Notes
- AWS SES sandbox mode requires verifying recipient emails
- Move to production mode in AWS SES for unrestricted sending
- Secret keys are masked after saving (shown as ••••••••••••)
- To update secret key, enter new value (masked value will be ignored)
- Test connection after updating settings
- Email notifications sent automatically on form submission
