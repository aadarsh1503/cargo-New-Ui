const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  submitEmploymentApplication,
  getEmploymentApplications,
  updateApplicationStage,
  sendStageEmail,
  sendCustomEmail,
  deleteEmploymentApplication,
  bulkDeleteApplications,
  exportToExcel,
  uploadCertificate
} = require('../controllers/employmentController');
const { protectAdmin } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and images are allowed.'));
    }
  }
});

// Configure multer for certificate uploads (larger size limit)
const certificateUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for certificates
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX are allowed for certificates.'));
    }
  }
});

// Public routes
router.post('/submit', upload.single('resume'), submitEmploymentApplication);

// Admin routes (protected)
router.get('/applications', protectAdmin, getEmploymentApplications);
router.patch('/applications/:id/stage', protectAdmin, updateApplicationStage);
router.post('/send-stage-email', protectAdmin, sendStageEmail);
router.post('/applications/send-custom-email', protectAdmin, sendCustomEmail);
router.post('/upload-certificate', protectAdmin, certificateUpload.single('certificate'), uploadCertificate);
router.delete('/applications/:id', protectAdmin, deleteEmploymentApplication);
router.post('/applications/bulk-delete', protectAdmin, bulkDeleteApplications);
router.get('/export', protectAdmin, exportToExcel);

module.exports = router;
