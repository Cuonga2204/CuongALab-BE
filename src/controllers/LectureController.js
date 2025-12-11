const Lecture = require("../models/LectureModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");
const cloudinary = require("../config/cloudinary");
const axios = require("axios");
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "course/videos",
          resource_type: "video",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });
};

const createLecture = async (req, res) => {
  try {
    let videoUrl = null;

    if (req.file) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "course/videos",
                resource_type: "video",
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });
      };

      const result = await streamUpload(req.file.buffer);
      videoUrl = result.secure_url;
    }

    const newLecture = await Lecture.create({
      ...req.body,
      video: videoUrl,
    });

    return successHandler(res, newLecture);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
const getLectureDetail = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return errorHandler(res, ERRORS.LECTURE_NOT_FOUND);

    return successHandler(res, lecture);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const getLecturesBySection = async (req, res) => {
  try {
    const lectures = await Lecture.find({
      section_id: req.params.sectionId,
    }).sort({ position_in_section: 1 });
    return successHandler(res, lectures);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const updateLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return errorHandler(res, ERRORS.LECTURE_NOT_FOUND);

    let videoUrl = lecture.video;

    if (req.file) {
      const result = await streamUpload(req.file.buffer);
      videoUrl = result.secure_url;
    }

    Object.assign(lecture, req.body, { video: videoUrl });
    await lecture.save();

    return successHandler(res, lecture);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
const reorderLectures = async (req, res) => {
  try {
    const { sectionId, newOrder } = req.body; // newOrder = [{ id, position_in_section }]

    const bulkOps = newOrder.map((item) => ({
      updateOne: {
        filter: { _id: item.id, section_id: sectionId },
        update: { position_in_section: item.position_in_section },
      },
    }));

    await Lecture.bulkWrite(bulkOps);
    return successHandler(res, { message: "Reordered successfully" });
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const deleteLecture = async (req, res) => {
  try {
    await Lecture.findByIdAndDelete(req.params.id);
    return successHandler(res, { message: "Lecture deleted" });
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const streamLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return errorHandler(res, ERRORS.LECTURE_NOT_FOUND);

    const videoUrl = lecture.video;
    if (!videoUrl)
      return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, "Video not found");

    // Lấy Range do FE gửi lên
    const range = req.headers.range;

    // Nếu không có Range => browser không tua -> gửi lỗi
    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    // Request tới Cloudinary có Range
    const cloudStream = await axios({
      method: "GET",
      url: videoUrl,
      responseType: "stream",
      headers: {
        Range: range, // Forward range xuống Cloudinary
      },
    });

    // Lấy header từ Cloudinary
    const contentRange = cloudStream.headers["content-range"];
    const contentLength = cloudStream.headers["content-length"];

    // Set header trả về FE
    res.writeHead(206, {
      "Content-Range": contentRange,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    });

    // Stream xuống FE
    cloudStream.data.pipe(res);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
module.exports = {
  createLecture,
  getLectureDetail,
  getLecturesBySection,
  updateLecture,
  deleteLecture,
  reorderLectures,
  streamLecture,
};
