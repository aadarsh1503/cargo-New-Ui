const express = require("express");
const multer = require("multer");
const router = express.Router();

const imagekit = require("../config/imagekit");
const pool = require("../config/db");
const { protectAdmin } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });




const formatFileObject = (dbRow) => {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    fileName: dbRow.file_name,
    filePath: dbRow.file_url,
    fileSize: dbRow.file_size,
    uploadedAt: dbRow.uploaded_at,
  };
};

// --- ALL ROUTES BELOW ARE NOW PROTECTED ---


router.get("/list", async (req, res) => {
  try {
    const sql = `
      SELECT id, file_name, file_url, file_size, uploaded_at 
      FROM uploaded_excels 
      ORDER BY uploaded_at DESC
    `;
    const [filesFromDb] = await pool.execute(sql);
    const formattedFiles = filesFromDb.map(formatFileObject);
    res.json(formattedFiles);
  } catch (error) {
    console.error("❌ [GET /list] - LIST ERROR:", error);
    res.status(500).json({ message: "Failed to fetch file list." });
  }
});


router.post("/upload", protectAdmin, upload.single("excelFile"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      
      const userId = req.admin.id;

      const uploadResponse = await imagekit.upload({
        file: req.file.buffer,
        fileName: req.file.originalname,
        folder: "/gvscargo/excels/",
        useUniqueFileName: true,
      });

      const sql = `
        INSERT INTO uploaded_excels (file_name, file_url, file_id_imagekit, file_size, user_id) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await pool.execute(sql, [
        req.file.originalname,
        uploadResponse.url,
        uploadResponse.fileId,
        req.file.size,
        userId,
      ]);

      const [rows] = await pool.execute("SELECT * FROM uploaded_excels WHERE id = ?", [result.insertId]);
      res.status(201).json(formatFileObject(rows[0]));

    } catch (error) {
      console.error("❌ [POST /upload] - FATAL UPLOAD ERROR:", error);
      res.status(500).json({ message: "Server error during file upload.", error: error.message });
    }
  }
);


router.put("/rename/:id", protectAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName || newName.trim() === "") {
      return res.status(400).json({ message: "New name is required." });
    }

    await pool.execute("UPDATE uploaded_excels SET file_name = ? WHERE id = ?", [newName.trim(), id]);
    const [rows] = await pool.execute("SELECT * FROM uploaded_excels WHERE id = ?", [id]);
    res.json(formatFileObject(rows[0]));

  } catch (error) {
    console.error(`❌ [PUT /rename] - RENAME ERROR for file ID ${req.params.id}:`, error);
    res.status(500).json({ message: "Failed to rename file." });
  }
});


router.delete("/delete/:id", protectAdmin, async (req, res) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
  
  
      const [rows] = await connection.execute("SELECT file_id_imagekit FROM uploaded_excels WHERE id = ?", [id]);
      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: "File not found in database." });
      }
      const imagekitFileId = rows[0].file_id_imagekit;
  

      try {

          await imagekit.deleteFile(imagekitFileId);
  
      } catch (imagekitError) {

          if (imagekitError && imagekitError.message && imagekitError.message.includes('The requested file does not exist.')) {

             
          } else {

              throw imagekitError;
          }
      }
  

      await connection.execute("DELETE FROM uploaded_excels WHERE id = ?", [id]);
      
      // 4. Commit the transaction
      await connection.commit();
      
      res.status(200).json({ message: "File deleted successfully.", id });
  
    } catch (error) {
      // This outer catch block will now only catch "hard" errors.
      await connection.rollback();
      console.error(`❌ [DELETE /delete] - FATAL DELETE ERROR for file ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete file due to a server or API error." });
  
    } finally {
      if (connection) connection.release();
    }
  });
module.exports = router;