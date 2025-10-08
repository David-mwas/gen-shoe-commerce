// src/routes/uploads.js
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../lib/cloudinary.js");
const {authMiddleware} = require("../middleware/auth.js");

const router = express.Router();

// multer memory storage (no temp files)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
});

function uploadToCloudinaryBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// single file upload
// POST /api/uploads
// body: multipart/form-data with field name 'file'
// returns { url, public_id, raw: {...} }
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    // only admins allowed to upload product images
    if (!req.user?.is_admin)
      return res.status(403).json({ message: "Admin only" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const folder = process.env.CLOUDINARY_FOLDER || "shoes";

    const result = await uploadToCloudinaryBuffer(req.file.buffer, {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    return res.json({
      url: result.secure_url,
      public_id: result.public_id,
      raw: result,
    });
  } catch (err) {
    console.error("Upload error", err);
    return res
      .status(500)
      .json({ message: "Upload failed", error: err.message || err });
  }
});

// Multiple files (optional) - POST /api/uploads/multiple (field name 'files')
// Protected by auth
router.post(
  "/multiple",
  authMiddleware,
  upload.array("files", 10),
  async (req, res) => {
    try {
      if (!req.user?.is_admin)
        return res.status(403).json({ message: "Admin only" });

      const files = req.files || [];
      const folder = process.env.CLOUDINARY_FOLDER || "shoes";
      const results = [];
      for (const f of files) {
        // @ts-ignore
        const r = await uploadToCloudinaryBuffer(f.buffer, {
          folder,
          resource_type: "image",
          quality: "auto",
          fetch_format: "auto",
        });
        results.push({ url: r.secure_url, public_id: r.public_id, raw: r });
      }
      return res.json(results);
    } catch (err) {
      console.error("Multiple upload error", err);
      return res
        .status(500)
        .json({ message: "Upload failed", error: err.message || err });
    }
  }
);

module.exports = router;
