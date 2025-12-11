const Comment = require("../models/CommentModel");
const Lecture = require("../models/LectureModel");
const Section = require("../models/SectionModel");
const UserCourse = require("../models/UserCourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

const addComment = async (req, res) => {
  try {
    const { lectureId, content, parentId, userId } = req.body;

    if (!userId) {
      return errorHandler(res, ERRORS.BAD_REQUEST, "userId is required");
    }

    // ================================
    // 1️⃣ LẤY LECTURE → SECTION
    // ================================
    const lecture = await Lecture.findById(lectureId);
    if (!lecture)
      return errorHandler(res, ERRORS.NOT_FOUND, "Lecture not found");

    const section = await Section.findById(lecture.section_id);
    if (!section)
      return errorHandler(res, ERRORS.NOT_FOUND, "Section not found");

    // ================================
    // 2️⃣ LẤY COURSE TỪ SECTION
    // ================================
    const courseId = section.course_id; // ⭐ chính xác

    // ================================
    // 3️⃣ CHECK USER ĐÃ MUA KHÓA HỌC CHƯA
    // ================================
    const hasBought = await UserCourse.findOne({
      user_id: userId,
      course_id: courseId,
    });

    if (!hasBought) {
      return errorHandler(
        res,
        ERRORS.UNAUTHORIZED,
        "Bạn chưa mua khóa học này"
      );
    }

    // ================================
    // 4️⃣ TẠO COMMENT
    // ================================
    const comment = await Comment.create({
      lecture_id: lectureId,
      user_id: userId,
      content,
      parent_id: parentId || null,
    });

    return successHandler(res, comment);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};
const getComments = async (req, res) => {
  try {
    const lectureId = req.params.lectureId;

    const comments = await Comment.find({ lecture_id: lectureId }).populate(
      "user_id",
      "name avatar email"
    );

    comments.sort((a, b) => b.likes.length - a.likes.length);

    return successHandler(res, comments);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const likeComment = async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment)
      return errorHandler(res, ERRORS.NOT_FOUND, "Comment not found");

    if (comment.likes.includes(userId)) {
      return errorHandler(res, ERRORS.BAD_REQUEST, "Already liked");
    }

    comment.likes.push(userId);
    await comment.save();

    return successHandler(res, comment);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

const unlikeComment = async (req, res) => {
  try {
    const { commentId, userId } = req.body;

    const comment = await Comment.findById(commentId);
    if (!comment)
      return errorHandler(res, ERRORS.NOT_FOUND, "Comment not found");

    comment.likes = comment.likes.filter((id) => id.toString() !== userId);
    await comment.save();

    return successHandler(res, comment);
  } catch (err) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, err.message);
  }
};

module.exports = {
  addComment,
  getComments,
  likeComment,
  unlikeComment,
};
