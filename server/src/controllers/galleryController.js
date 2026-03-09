const pool = require('../config/db');
const imagekit = require('../config/imagekit');

// Get all active gallery images (public)
const getGalleryImages = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, description, image_url, display_order FROM gallery WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ message: 'Error fetching gallery images' });
    }
};

// Get all gallery images (admin)
const getAllGalleryImages = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM gallery ORDER BY display_order ASC, created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching gallery images:', error);
        res.status(500).json({ message: 'Error fetching gallery images' });
    }
};

// Upload new gallery image
const uploadGalleryImage = async (req, res) => {
    try {
        const { title, description, display_order } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Upload to ImageKit
        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: '/gallery'
        });

        // Save to database
        const [result] = await pool.query(
            'INSERT INTO gallery (title, description, image_url, image_id_imagekit, display_order) VALUES (?, ?, ?, ?, ?)',
            [title || '', description || '', uploadResponse.url, uploadResponse.fileId, display_order || 0]
        );

        res.status(201).json({
            message: 'Image uploaded successfully',
            id: result.insertId,
            image_url: uploadResponse.url
        });
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};

// Update gallery image
const updateGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, display_order, is_active } = req.body;

        const [result] = await pool.query(
            'UPDATE gallery SET title = ?, description = ?, display_order = ?, is_active = ? WHERE id = ?',
            [title, description, display_order, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        res.json({ message: 'Image updated successfully' });
    } catch (error) {
        console.error('Error updating gallery image:', error);
        res.status(500).json({ message: 'Error updating image' });
    }
};

// Delete gallery image
const deleteGalleryImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Get image details
        const [rows] = await pool.query('SELECT image_id_imagekit FROM gallery WHERE id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imagekitFileId = rows[0].image_id_imagekit;

        // Delete from ImageKit
        if (imagekitFileId) {
            try {
                await imagekit.deleteFile(imagekitFileId);
            } catch (imagekitError) {
                console.log('ImageKit deletion error (continuing):', imagekitError.message);
            }
        }

        // Delete from database
        await pool.query('DELETE FROM gallery WHERE id = ?', [id]);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting gallery image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
};

module.exports = {
    getGalleryImages,
    getAllGalleryImages,
    uploadGalleryImage,
    updateGalleryImage,
    deleteGalleryImage
};
