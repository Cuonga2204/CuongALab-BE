// routes/UploadRouter.js
const express = require("express");
const router = express.Router();
const uploadImage = require("../middleware/uploadImage.middleware");

router.post(
  "/ckeditor-image",
  uploadImage.single("upload"), // CKEditor bắt buộc field name = upload
  (req, res) => {
    return res.json({
      url: req.file.path, // Cloudinary URL
    });
  }
);

module.exports = router;
