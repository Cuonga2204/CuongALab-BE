// src/controllers/SectionController.js
const Section = require("../models/SectionModel");
const Lecture = require("../models/LectureModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

/** =======================
 *  🟢 TẠO SECTION MỚI
 *  ======================= */
const createSection = async (req, res) => {
  try {
    const { course_id, title } = req.body;

    // Đếm số lượng section hiện có để set thứ tự tiếp theo
    const count = await Section.countDocuments({ course_id });

    const section = await Section.create({
      course_id,
      title,
      order: count, // luôn nằm cuối danh sách
    });

    return successHandler(res, section);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/** =======================
 *  🟢 LẤY DANH SÁCH SECTION THEO COURSE
 *  ======================= */
const getSectionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const sections = await Section.find({ course_id: courseId }).sort({
      order: 1,
    });
    return successHandler(res, sections);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/** =======================
 *  🟢 LẤY CHI TIẾT SECTION (KÈM LECTURE)
 *  ======================= */
const getSectionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return errorHandler(res, ERRORS.NOT_FOUND);

    const lectures = await Lecture.find({ section_id: id }).sort({
      lecture_title: 1,
    });

    return successHandler(res, { section, lectures });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/** =======================
 *  🟢 CẬP NHẬT SECTION
 *  ======================= */
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!section) return errorHandler(res, ERRORS.NOT_FOUND);
    return successHandler(res, section);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/** =======================
 *  🟠 XOÁ SECTION (VÀ CÁC LECTURE LIÊN QUAN)
 *  ======================= */
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) return errorHandler(res, ERRORS.NOT_FOUND);

    await Lecture.deleteMany({ section_id: id });
    await Section.findByIdAndDelete(id);

    return successHandler(res, { message: "Deleted successfully" });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/** =======================
 *  🔁 REORDER SECTIONS (KÉO-THẢ)
 *  ======================= */
const reorderSections = async (req, res) => {
  try {
    const { courseId, newOrder } = req.body; // [{id, order}, ...]
    const bulkOps = newOrder.map((item) => ({
      updateOne: {
        filter: { _id: item.id, course_id: courseId },
        update: { order: item.order },
      },
    }));
    await Section.bulkWrite(bulkOps);
    return successHandler(res, { message: "Reordered successfully" });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createSection,
  getSectionsByCourse,
  getSectionDetail,
  updateSection,
  deleteSection,
  reorderSections, // thêm export để tránh lỗi undefined trong router
};
