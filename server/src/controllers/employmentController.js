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
      name, email, mobile, dob, gender, nationality, current_location,
      qualification, university, department, internship_coordinator,
      hours, joining_date, disability, disability_type
    } = req.body;

    console.log('Received internship application:', {
      name, email, mobile, university, department
    });

    // Validate required fields
    if (!name || !email || !mobile || !dob || !gender || !qualification || !university || !department) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please fill all required fields' 
      });
    }

    let resumeUrl = null;

    // Handle file upload
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const fileName = `employment_resumes/${Date.now()}_${req.file.originalname}`;

      const isPdf = req.file.mimetype === 'application/pdf';
      const isDocx = req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                     req.file.mimetype === 'application/msword';
      const isImage = req.file.mimetype.startsWith('image/');

      if (isPdf || isDocx) {
        const uploadResult = await imagekit.upload({
          file: fileBuffer.toString('base64'),
          fileName: fileName,
          folder: '/employment_resumes'
        });
        resumeUrl = uploadResult.url;
      } else if (isImage) {
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'employment_resumes' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(fileBuffer);
        });
        resumeUrl = uploadResult.secure_url;
      }
    }

    // Insert into database
    const [result] = await pool.query(
      `INSERT INTO employment_applications 
      (name, email, mobile, dob, gender, nationality, current_location, qualification, 
       university, department, internship_coordinator, hours, joining_date, 
       resume_url, disability, disability_type, stage) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Applied')`,
      [name, email, mobile, dob, gender, nationality || null, current_location || null, 
       qualification, university, department, internship_coordinator || null, 
       hours || null, joining_date || null, resumeUrl, disability || 'No', 
       disability_type || null]
    );

    // Send confirmation email to applicant
    const applicantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284C7;">Thank You for Your Application!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for applying for the internship position in the <strong>${department}</strong> department at Global Vision Solutions.</p>
        <p>We have received your application and our team will review it shortly. We will contact you regarding the next steps.</p>
        <p>If you have any questions, please contact us at info@gvs-bh.com</p>
        <br>
        <p>Best regards,<br>
        <strong>GVS Internship Team</strong><br>
        Global Vision Solutions</p>
      </div>
    `;

    await sendEmail(email, 'Internship Application Received - GVS', applicantEmailHtml);

    // Send notification email to admin
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0284C7;">New Internship Application Received</h2>
        <h3>Applicant Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${name}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Mobile:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${mobile}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>University:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${university}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Department:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${department}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Qualification:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${qualification}</td></tr>
          ${internship_coordinator ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Coordinator:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${internship_coordinator}</td></tr>` : ''}
          ${hours ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Hours:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${hours}</td></tr>` : ''}
          ${joining_date ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Joining Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(joining_date).toLocaleDateString()}</td></tr>` : ''}
          ${resumeUrl ? `<tr><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Resume:</strong></td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><a href="${resumeUrl}">View Resume</a></td></tr>` : ''}
        </table>
        <p style="margin-top: 20px;"><strong>Application ID:</strong> ${result.insertId}</p>
        <p><strong>Submitted at:</strong> ${new Date().toLocaleString()}</p>
        <p>Please review this application in the admin panel.</p>
      </div>
    `;

    await sendEmail('info@gvs-bh.com', `New Internship Application - ${name} (${department})`, adminEmailHtml);

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
      query += ' AND position_applied LIKE ?';
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

    // Get current stage to validate transition
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

    const currentStage = applications[0].stage;

    // Define allowed stage transitions (no going back)
    const stageFlow = {
      'Applied': ['Applied', 'Interview'],
      'Interview': ['Interview', 'Accepted', 'Rejected'],
      'Accepted': ['Accepted', 'Completion', 'Certification'],
      'Rejected': ['Rejected'], // Terminal stage
      'Completion': ['Completion', 'Certification'],
      'Certification': ['Certification'] // Terminal stage
    };

    const allowedStages = stageFlow[currentStage] || ['Applied'];

    if (!allowedStages.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change stage from ${currentStage} to ${stage}. Allowed stages: ${allowedStages.join(', ')}`
      });
    }

    const [result] = await pool.query(
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

    // Validate required fields based on stage
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
      // Use the message content directly (already formatted by frontend)
      const emailContent = message || `Dear ${app.name},\n\nYour application status has been updated.\n\nBest regards,\nGVS Internship Team`;
      
      // Convert plain text to HTML with proper formatting
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white;">
          <div style="background: #0284C7; padding: 40px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">GVS Internship Program</h1>
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

      // Update stage in database
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

    // Upload to ImageKit
    const uploadResult = await imagekit.upload({
      file: fileBuffer.toString('base64'),
      fileName: fileName,
      folder: '/internship_certificates'
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
          <p>Dear ${app.name},</p>
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
      query += ' AND position_applied LIKE ?';
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

    // Convert to CSV
    const headers = [
      'ID', 'Name', 'Email', 'Mobile', 'DOB', 'Gender', 'Nationality', 'Location',
      'Qualification', 'Experience (Years)', 'Current Company', 'Position Applied',
      'Expected Salary', 'Notice Period', 'Skills', 'LinkedIn', 'Portfolio',
      'Resume URL', 'Disability', 'Disability Type', 'Stage', 'Interview Date',
      'Interview Time', 'Interview Venue', 'Created At'
    ];

    const csvRows = [headers.join(',')];

    applications.forEach(app => {
      const row = [
        app.id,
        `"${app.name}"`,
        app.email,
        app.mobile,
        app.dob ? new Date(app.dob).toLocaleDateString() : '',
        app.gender,
        app.nationality || '',
        `"${app.current_location || ''}"`,
        `"${app.qualification}"`,
        app.experience_years || '',
        `"${app.current_company || ''}"`,
        `"${app.position_applied}"`,
        app.expected_salary || '',
        app.notice_period || '',
        `"${app.skills || ''}"`,
        app.linkedin_url || '',
        app.portfolio_url || '',
        app.resume_url || '',
        app.disability,
        app.disability_type || '',
        app.stage,
        app.interview_date ? new Date(app.interview_date).toLocaleString() : '',
        app.interview_time || '',
        `"${app.interview_venue || ''}"`,
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
