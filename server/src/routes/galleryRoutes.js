const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protectAdmin } = require('../middleware/authMiddleware');
const {
    getGalleryImages,
    getAllGalleryImages,
    uploadGalleryImage,
    updateGalleryImage,
    deleteGalleryImage
} = require('../controllers/galleryController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get('/', getGalleryImages);

// Admin routes
router.get('/admin/all', protectAdmin, getAllGalleryImages);
router.post('/admin/upload', protectAdmin, upload.single('image'), uploadGalleryImage);
router.put('/admin/:id', protectAdmin, updateGalleryImage);
router.delete('/admin/:id', protectAdmin, deleteGalleryImage);

module.exports = router;
