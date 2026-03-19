const nodemailer = require('nodemailer');
const { sendMail } = require('./emailProvider');

// Legacy transporter (kept for any direct imports, uses env SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendMail({
    to: email,
    subject: 'Your Password Reset Request',
    html: `
      <p>You requested a password reset for your GVS Cargo admin account.</p>
      <p>Click this link to set a new password:</p>
      <a href="${resetUrl}" target="_blank">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  });
};

module.exports = { sendPasswordResetEmail, transporter };
