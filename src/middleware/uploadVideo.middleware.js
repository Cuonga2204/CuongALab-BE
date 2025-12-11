const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["video/mp4", "video/mkv", "video/webm", "video/avi"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Invalid video type! Only mp4/mkv/webm/avi allowed."));
};

const uploadVideo = multer({ storage, fileFilter });

module.exports = uploadVideo;
