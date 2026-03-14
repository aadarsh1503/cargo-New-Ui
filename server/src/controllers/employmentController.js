const pool = require('../config/db');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const cloudinary = require('cloudinary').v2;
const ImageKit = require('imagekit');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Helper function to get AWS settings from database
async function getAWSSettings() {
  const [settings] = await pool.query('SELECT setting_key, setting_value FROM aws_settings');
  const config = {};
  settings.forEach(setting => {
    config[setting.setting_key] = setting.setting_value;
  });
  return config;
}

// Helper function to send email via AWS SES
async function sendEmail(to, subject, htmlBody) {
  try {
    const awsConfig = await getAWSSettings();
    
    const sesClient = new SESClient({
      region: awsConfig.AWS_REGION || process.env.AWS_REGION,
      credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
      }
    });

    const params = {
      Source: `${awsConfig.AWS_SES_FROM_NAME || process.env.AWS_SES_FROM_NAME} <${awsConfig.AWS_SES_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL}>`,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to]
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlBody,
            Charset: 'UTF-8'
          }
        }
      },
      ReplyToAddresses: [awsConfig.AWS_SES_FROM_EMAIL || process.env.AWS_SES_FROM_EMAIL]
    };

    const command = new SendEmailCommand(params);
    return await sesClient.send(command);
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}

// Submit Employment Application (Public)
exports.submitEmploymentApplication = async (req, res) => {
  try {
    const {
      email, fullName, dateOfBirth, gender, nationality, mobileContact, whatsapp,
      currentAddress, postalCode, city, country, cprNationalId, passportId, passportValidity,
      educationLevel, courseDegree, currentlyEmployed, employmentDesired, yearsOfExperience,
      availableStart, shiftAvailable, canTravel, drivingLicense, skills,
      ref1Name, ref1Contact, ref1Email, ref2Name, ref2Contact, ref2Email,
      ref3Name, ref3Contact, ref3Email, visaStatus, visaValidity,
      expectedSalary, clientLeadsStrategy
    } = req.body;

    console.log('Received employment application:', {
      fullName, email, mobileContact, employmentDesired
    });

    // Validate required fields
    if (!email || !fullName || !dateOfBirth || !gender || !nationality || !mobileContact || 
        !whatsapp || !currentAddress || !postalCode || !city || !country ||
        !educationLevel || !courseDegree || !currentlyEmployed || !employmentDesired ||
        !availableStart || !shiftAvailable || !canTravel || !drivingLicense || !skills ||
        !expectedSalary || !clientLeadsStrategy) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }

    let resumeUrl = null;

    // Handle file upload using Cloudinary
    if (req.file) {
      const fileBuffer = req.file.buffer;

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder: 'employment_resumes',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(fileBuffer);
      });
      resumeUrl = uploadResult.secure_url;
    }

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO employment_applications 
      (email, fullName, dateOfBirth, gender, nationality, mobileContact, whatsapp,
       currentAddress, postalCode, city, country, cprNationalId, passportId, passportValidity,
       educationLevel, courseDegree, currentlyEmployed, employmentDesired, yearsOfExperience,
       availableStart, shiftAvailable, canTravel, drivingLicense, skills,
       ref1Name, ref1Contact, ref1Email, ref2Name, ref2Contact, ref2Email,
       ref3Name, ref3Contact, ref3Email, visaStatus, visaValidity,
       expectedSalary, clientLeadsStrategy, resume_url, stage) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email, fullName, dateOfBirth, gender, nationality, mobileContact, whatsapp,
        currentAddress, postalCode, city, country, cprNationalId || null, passportId || null, passportValidity || null,
        educationLevel, courseDegree, currentlyEmployed, employmentDesired, yearsOfExperience || null,
        availableStart, shiftAvailable, canTravel, drivingLicense, skills,
        ref1Name || null, ref1Contact || null, ref1Email || null, 
        ref2Name || null, ref2Contact || null, ref2Email || null,
        ref3Name || null, ref3Contact || null, ref3Email || null, 
        visaStatus || null, visaValidity || null,
        expectedSalary, clientLeadsStrategy, resumeUrl, 'Applied'
      ]
    );

    // Send confirmation email to applicant
    const applicantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284C7;">Thank You for Your Application!</h2>
        <p>Dear ${fullName},</p>
        <p>Thank you for applying for the <strong>${employmentDesired}</strong> position at Global Vision Solutions.</p>
        <p>We have received your application and our team will review it shortly. We will contact you regarding the next steps.</p>
        <p>If you have any questions, please contact us at info@gvs-bh.com</p>
        <br>
        <p>Best regards,<br>
        <strong>GVS HR Team</strong><br>
        Global Vision Solutions</p>
      </div>
    `;

    await sendEmail(email, 'Employment Application Received - GVS', applicantEmailHtml);

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284C7;">New Employment Application Received</h2>
        <h3>Applicant Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${fullName}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Mobile:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${mobileContact}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Position:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${employmentDesired}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Education:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${educationLevel} - ${courseDegree}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Expected Salary:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">BHD ${expectedSalary}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Available Start:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(availableStart).toLocaleDateString()}</td></tr>
          ${resumeUrl ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Resume:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="${resumeUrl}">View Resume</a></td></tr>` : ''}
        </table>
        <p style="margin-top: 20px;"><strong>Application ID:</strong> ${result.insertId}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <p>Please review this application in the admin panel.</p>
      </div>
    `;

    // Send to test email for testing purposes
    await sendEmail('info@gvs-bh.com', `New Employment Application - ${fullName} (${employmentDesired})`, adminEmailHtml);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: result.insertId
    });

  } catch (error) {
    console.error('Error submitting employment application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
};

// Get all employment applications (Admin)
exports.getEmploymentApplications = async (req, res) => {
  try {
    const { stage, position, month, year } = req.query;

    let query = 'SELECT * FROM employment_applications WHERE 1=1';
    const params = [];

    if (stage) {
      query += ' AND stage = ?';
      params.push(stage);
    }

    if (position) {
      query += ' AND employmentDesired LIKE ?';
      params.push(`%${position}%`);
    }

    if (month && year) {
      query += ' AND MONTH(created_at) = ? AND YEAR(created_at) = ?';
      params.push(month, year);
    } else if (year) {
      query += ' AND YEAR(created_at) = ?';
      params.push(year);
    }

    query += ' ORDER BY created_at DESC';

    const [applications] = await pool.query(query, params);

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    console.error('Error fetching employment applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

// Update application stage (Admin)
exports.updateApplicationStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const validStages = ['Applied', 'Interview', 'Accepted', 'Rejected', 'Completion', 'Certification'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stage'
      });
    }

    const [applications] = await pool.query(
      'SELECT stage FROM employment_applications WHERE id = ?',
      [id]
    );

    if (applications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await pool.query(
      'UPDATE employment_applications SET stage = ? WHERE id = ?',
      [stage, id]
    );

    res.status(200).json({
      success: true,
      message: 'Stage updated successfully'
    });

  } catch (error) {
    console.error('Error updating stage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stage',
      error: error.message
    });
  }
};

// Send stage update email (Admin)
exports.sendStageEmail = async (req, res) => {
  try {
    const { applicationIds, newStage, subject, message, date, time, venue, certificateUrl } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No application IDs provided'
      });
    }

    if (newStage === 'Interview') {
      if (!date || !time || !venue) {
        return res.status(400).json({
          success: false,
          message: 'Date, time, and venue are required for interview stage'
        });
      }
    }

    if (newStage === 'Certification' && !certificateUrl) {
      return res.status(400).json({
        success: false,
        message: 'Certificate is required for certification stage'
      });
    }

    const placeholders = applicationIds.map(() => '?').join(',');
    const [applications] = await pool.query(
      `SELECT * FROM employment_applications WHERE id IN (${placeholders})`,
      applicationIds
    );

    for (const app of applications) {
      const emailContent = message || `Dear ${app.fullName},\n\nYour application status has been updated.\n\nBest regards,\nGVS HR Team`;
      
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background: #0284C7; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">GVS Employment</h1>
          </div>
          <div style="padding: 40px 30px; white-space: pre-wrap; line-height: 1.6;">
            ${emailContent.replace(/\n/g, '<br>')}
          </div>
          <div style="background-color: #000000; color: white; padding: 30px 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">Global Vision Solutions</p>
            <p style="margin: 0; font-size: 14px; color: #9CA3AF;">Building Future Leaders</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333333;">
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">© ${new Date().getFullYear()} Global Vision Solutions. All rights reserved.</p>
            </div>
          </div>
        </div>
      `;

      await sendEmail(app.email, subject, emailHtml);

      await pool.query(
        'UPDATE employment_applications SET stage = ? WHERE id = ?',
        [newStage, app.id]
      );
    }

    res.status(200).json({
      success: true,
      message: `Emails sent and stage updated for ${applications.length} application(s)`
    });

  } catch (error) {
    console.error('Error sending stage email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send emails',
      error: error.message
    });
  }
};

// Upload certificate (Admin)
exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const fileBuffer = req.file.buffer;
    const fileName = `certificates/${Date.now()}_${req.file.originalname}`;

    const uploadResult = await imagekit.upload({
      file: fileBuffer.toString('base64'),
      fileName: fileName,
      folder: '/employment_certificates'
    });

    res.status(200).json({
      success: true,
      url: uploadResult.url
    });

  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate',
      error: error.message
    });
  }
};

// Send custom email (Admin)
exports.sendCustomEmail = async (req, res) => {
  try {
    const { applicationIds, subject, message, attachmentUrl } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No application IDs provided'
      });
    }

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    const placeholders = applicationIds.map(() => '?').join(',');
    const [applications] = await pool.query(
      `SELECT * FROM employment_applications WHERE id IN (${placeholders})`,
      applicationIds
    );

    for (const app of applications) {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0284C7;">${subject}</h2>
          <p>Dear ${app.fullName},</p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          ${attachmentUrl ? `<p><a href="${attachmentUrl}" style="color: #0284C7; text-decoration: underline;">View Attachment</a></p>` : ''}
          <br>
          <p>Best regards,<br>
          <strong>GVS HR Team</strong><br>
          Global Vision Solutions</p>
        </div>
      `;

      await sendEmail(app.email, subject, emailHtml);
    }

    res.status(200).json({
      success: true,
      message: `Email sent to ${applications.length} applicant(s)`
    });

  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email',
      error: error.message
    });
  }
};

// Delete application (Admin)
exports.deleteEmploymentApplication = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM employment_applications WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message
    });
  }
};

// Bulk delete applications (Admin)
exports.bulkDeleteApplications = async (req, res) => {
  try {
    const { applicationIds } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No application IDs provided'
      });
    }

    const placeholders = applicationIds.map(() => '?').join(',');
    const query = `DELETE FROM employment_applications WHERE id IN (${placeholders})`;
    const [result] = await pool.query(query, applicationIds);

    res.status(200).json({
      success: true,
      message: `${result.affectedRows} application(s) deleted successfully`,
      deletedCount: result.affectedRows
    });

  } catch (error) {
    console.error('Error bulk deleting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete applications',
      error: error.message
    });
  }
};

// Export to Excel (Admin)
exports.exportToExcel = async (req, res) => {
  try {
    const { stage, position, month, year } = req.query;

    let query = 'SELECT * FROM employment_applications WHERE 1=1';
    const params = [];

    if (stage) {
      query += ' AND stage = ?';
      params.push(stage);
    }

    if (position) {
      query += ' AND employmentDesired LIKE ?';
      params.push(`%${position}%`);
    }

    if (month && year) {
      query += ' AND MONTH(created_at) = ? AND YEAR(created_at) = ?';
      params.push(month, year);
    } else if (year) {
      query += ' AND YEAR(created_at) = ?';
      params.push(year);
    }

    query += ' ORDER BY created_at DESC';

    const [applications] = await pool.query(query, params);

    const headers = [
      'ID', 'Full Name', 'Email', 'Mobile', 'WhatsApp', 'DOB', 'Gender', 'Nationality',
      'Address', 'City', 'Country', 'Postal Code', 'CPR/National ID', 'Passport ID', 'Passport Validity',
      'Education Level', 'Course/Degree', 'Currently Employed', 'Employment Desired', 'Years of Experience',
      'Available Start', 'Shift Available', 'Can Travel', 'Driving License', 'Skills',
      'Ref1 Name', 'Ref1 Contact', 'Ref1 Email', 'Ref2 Name', 'Ref2 Contact', 'Ref2 Email',
      'Ref3 Name', 'Ref3 Contact', 'Ref3 Email', 'Visa Status', 'Visa Validity',
      'Expected Salary', 'Client Leads Strategy', 'Resume URL', 'Stage', 'Created At'
    ];

    const csvRows = [headers.join(',')];

    applications.forEach(app => {
      const row = [
        app.id,
        `"${app.fullName || ''}"`,
        app.email || '',
        app.mobileContact || '',
        app.whatsapp || '',
        app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : '',
        app.gender || '',
        app.nationality || '',
        `"${app.currentAddress || ''}"`,
        app.city || '',
        app.country || '',
        app.postalCode || '',
        app.cprNationalId || '',
        app.passportId || '',
        app.passportValidity ? new Date(app.passportValidity).toLocaleDateString() : '',
        app.educationLevel || '',
        `"${app.courseDegree || ''}"`,
        app.currentlyEmployed || '',
        `"${app.employmentDesired || ''}"`,
        app.yearsOfExperience || '',
        app.availableStart ? new Date(app.availableStart).toLocaleDateString() : '',
        app.shiftAvailable || '',
        app.canTravel || '',
        app.drivingLicense || '',
        `"${app.skills || ''}"`,
        `"${app.ref1Name || ''}"`,
        app.ref1Contact || '',
        app.ref1Email || '',
        `"${app.ref2Name || ''}"`,
        app.ref2Contact || '',
        app.ref2Email || '',
        `"${app.ref3Name || ''}"`,
        app.ref3Contact || '',
        app.ref3Email || '',
        app.visaStatus || '',
        app.visaValidity ? new Date(app.visaValidity).toLocaleDateString() : '',
        app.expectedSalary || '',
        `"${app.clientLeadsStrategy || ''}"`,
        app.resume_url || '',
        app.stage || '',
        new Date(app.created_at).toLocaleString()
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=employment_applications_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};
