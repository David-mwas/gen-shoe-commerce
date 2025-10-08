// // src/routes/uploads.js
// const express = require("express");
// const multer = require("multer");
// const streamifier = require("streamifier");
// const cloudinary = require("../lib/cloudinary.js");
// const {authMiddleware} = require("../middleware/auth.js");

// const router = express.Router();

// // multer memory storage (no temp files)
// const storage = multer.memoryStorage();
// const upload = multer({
//   storage,
//   limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
// });

// function uploadToCloudinaryBuffer(buffer, options = {}) {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       options,
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// }

// // single file upload
// // POST /api/uploads
// // body: multipart/form-data with field name 'file'
// // returns { url, public_id, raw: {...} }
// router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
//   try {
//     // only admins allowed to upload product images
//     if (!req.user?.is_admin)
//       return res.status(403).json({ message: "Admin only" });

//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const folder = process.env.CLOUDINARY_FOLDER || "shoes";

//     const result = await uploadToCloudinaryBuffer(req.file.buffer, {
//       folder,
//       resource_type: "image",
//       quality: "auto",
//       fetch_format: "auto",
//     });

//     return res.json({
//       url: result.secure_url,
//       public_id: result.public_id,
//       raw: result,
//     });
//   } catch (err) {
//     console.error("Upload error", err);
//     return res
//       .status(500)
//       .json({ message: "Upload failed", error: err.message || err });
//   }
// });

// // Multiple files (optional) - POST /api/uploads/multiple (field name 'files')
// // Protected by auth
// router.post(
//   "/multiple",
//   authMiddleware,
//   upload.array("files", 10),
//   async (req, res) => {
//     try {
//       if (!req.user?.is_admin)
//         return res.status(403).json({ message: "Admin only" });

//       const files = req.files || [];
//       const folder = process.env.CLOUDINARY_FOLDER || "shoes";
//       const results = [];
//       for (const f of files) {
//         // @ts-ignore
//         const r = await uploadToCloudinaryBuffer(f.buffer, {
//           folder,
//           resource_type: "image",
//           quality: "auto",
//           fetch_format: "auto",
//         });
//         results.push({ url: r.secure_url, public_id: r.public_id, raw: r });
//       }
//       return res.json(results);
//     } catch (err) {
//       console.error("Multiple upload error", err);
//       return res
//         .status(500)
//         .json({ message: "Upload failed", error: err.message || err });
//     }
//   }
// );

// module.exports = router;



// src/routes/uploads.js
const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../lib/cloudinary.js"); // your cloudinary v2 export
const { authMiddleware } = require("../middleware/auth.js");

const router = express.Router();

// multer memory storage (no temp files)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
});

function uploadToCloudinaryBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

// single file upload
// POST /api/uploads
// body: multipart/form-data with field name 'file'
// returns { url, transparent_url?, public_id, raw: { original, transparent? } }
router.post("/", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    // only admins allowed to upload product images
    if (!req.user?.is_admin) return res.status(403).json({ message: "Admin only" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const folder = process.env.CLOUDINARY_FOLDER || "shoes";

    // 1) upload original
    const original = await uploadToCloudinaryBuffer(req.file.buffer, {
      folder,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
    });

    // 2) try to create a transparent background version
    // This uses a transformation effect that Cloudinary provides on some plans.
    // If your account lacks the add-on, this call may fail — we catch and continue.
    let transparent = null;
    try {
      // Create a new derived upload by instructing Cloudinary to fetch the original
      // and apply a background removal transformation, output PNG so alpha preserved.
      // NOTE: the exact effect name (background_removal / remove_background / e_background_removal)
      // can vary by account/plan. This uses 'background_removal' which works for many accounts.
      transparent = await cloudinary.uploader.upload(original.secure_url, {
        folder,
        public_id: `${original.public_id}_transparent`,
        overwrite: true,
        resource_type: "image",
        transformation: [
          // attempt background removal -> convert to png (keeps alpha)
          { effect: "background_removal" },
          { format: "png" },
        ],
      });

      // If your account rejects "background_removal", cloudinary will throw and we fall back.
    } catch (bgErr) {
      console.warn("Background removal failed (Cloudinary transformation). Falling back to original. Error:", bgErr?.message || bgErr);
      transparent = null;
    }

    return res.json({
      url: original.secure_url,
      public_id: original.public_id,
      transparent_url: transparent ? transparent.secure_url : null,
      raw: { original, transparent },
    });
  } catch (err) {
    console.error("Upload error", err);
    return res.status(500).json({ message: "Upload failed", error: err.message || err });
  }
});

// multiple files (optional)
router.post("/multiple", authMiddleware, upload.array("files", 10), async (req, res) => {
  try {
    if (!req.user?.is_admin) return res.status(403).json({ message: "Admin only" });

    const files = req.files || [];
    const folder = process.env.CLOUDINARY_FOLDER || "shoes";
    const results = [];

    for (const f of files) {
      const original = await uploadToCloudinaryBuffer(f.buffer, {
        folder,
        resource_type: "image",
        quality: "auto",
        fetch_format: "auto",
      });

      let transparent = null;
      try {
        transparent = await cloudinary.uploader.upload(original.secure_url, {
          folder,
          public_id: `${original.public_id}_transparent`,
          overwrite: true,
          resource_type: "image",
          transformation: [{ effect: "background_removal" }, { format: "png" }],
        });
      } catch (bgErr) {
        console.warn("Background removal failed for file, continuing with original:", bgErr?.message || bgErr);
        transparent = null;
      }

      results.push({ url: original.secure_url, public_id: original.public_id, transparent_url: transparent ? transparent.secure_url : null, raw: { original, transparent } });
    }

    return res.json(results);
  } catch (err) {
    console.error("Multiple upload error", err);
    return res.status(500).json({ message: "Upload failed", error: err.message || err });
  }
});

module.exports = router;
