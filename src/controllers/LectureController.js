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
    if (!lecture || !lecture.video) {
      return res.status(404).send("Video not found");
    }

    const range = req.headers.range;
    if (!range) {
      return res.status(416).send("Requires Range header");
    }

    const cloudRes = await axios.get(lecture.video, {
      responseType: "stream",
      headers: {
        Range: range,
      },
    });

    res.writeHead(206, {
      "Content-Range": cloudRes.headers["content-range"],
      "Accept-Ranges": "bytes",
      "Content-Length": cloudRes.headers["content-length"],
      "Content-Type": "video/mp4",
      "Cache-Control": "no-store",
    });

    cloudRes.data.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Stream error");
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
