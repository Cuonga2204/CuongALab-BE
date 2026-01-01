const mongoose = require("mongoose");
const { ReviewForm, CourseReview } = require("../models/CourseReviewModel");
const Course = require("../models/CourseModel");

/* =========================================================
   ADMIN
========================================================= */

/**
 * GET review form (admin + user)
 */
const getReviewForm = async (req, res) => {
  try {
    const form = await ReviewForm.findOne().lean();

    return res.json({
      success: true,
      data: {
        questions: form?.questions || [],
        is_active: form?.is_active ?? true,
      },
    });
  } catch (error) {
    console.error("getReviewForm error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get review form",
    });
  }
};

/**
 * ADMIN: GET ALL COURSE REVIEWS (PAGINATION + SEARCH)
 */
const getAllCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;

    const filter = {};
    if (userId) filter.user_id = userId;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      CourseReview.find(filter)
        .populate("user_id", "name avatar")
        .populate("course_id", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),

      CourseReview.countDocuments(filter),
    ]);

    // lấy form để map question label
    const reviewForm = await ReviewForm.findOne({ is_active: true }).lean();
    const questionMap = {};
    reviewForm?.questions.forEach((q) => {
      questionMap[q.id] = q.label;
    });

    const mappedItems = items.map((r) => ({
      id: r._id,
      user: r.user_id,
      course: r.course_id,
      rating: r.rating,
      satisfaction: r.satisfaction,
      comment: r.comment,
      createdAt: r.createdAt,
      answers: r.answers.map((a) => ({
        question_id: a.question_id,
        question_label: questionMap[a.question_id] || a.question_id,
        value: a.value,
      })),
    }));

    res.json({
      success: true,
      data: {
        items: mappedItems,
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
/**
 * UPDATE review form (admin)
 * - BE tự sinh id cho question nếu thiếu
 * - KHÔNG đổi id khi edit
 */
const updateReviewForm = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({
        success: false,
        message: "Questions must be an array",
      });
    }

    /* ===== NORMALIZE QUESTIONS ===== */
    const normalizedQuestions = questions.map((q) => {
      if (!q.label || !Array.isArray(q.options)) {
        throw new Error("Invalid question format");
      }

      return {
        id: q.id ? q.id : new mongoose.Types.ObjectId().toString(), // 🔑 sinh ID CHỈ KHI ADD
        label: q.label,
        options: q.options,
      };
    });

    const form = await ReviewForm.findOneAndUpdate(
      {},
      {
        questions: normalizedQuestions,
      },
      {
        upsert: true,
        new: true,
      }
    ).lean();

    return res.json({
      success: true,
      data: {
        questions: form.questions,
        is_active: form.is_active,
      },
    });
  } catch (error) {
    console.error("updateReviewForm error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update review form",
    });
  }
};

/* =========================================================
   USER
========================================================= */

/**
 * SUBMIT / UPDATE course review
 * Điều kiện:
 * - Đã hoàn thành >= 80% khóa học
 * - Validate custom answers theo ReviewForm
 */
const submitCourseReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId, rating, satisfaction, comment, answers = [] } = req.body;

    /* ===== VALIDATE IDS ===== */
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    /* ===== VALIDATE DEFAULT QUESTIONS ===== */
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating phải từ 1 đến 5",
      });
    }

    if (typeof satisfaction !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Satisfaction phải là true / false",
      });
    }

    /* ===== VALIDATE CUSTOM QUESTIONS ===== */
    const form = await ReviewForm.findOne().lean();

    if (form?.questions?.length) {
      if (!Array.isArray(answers)) {
        return res.status(400).json({
          success: false,
          message: "Answers must be an array",
        });
      }

      for (const q of form.questions) {
        const found = answers.find((a) => a.question_id === q.id);

        if (!found) {
          return res.status(400).json({
            success: false,
            message: `Thiếu câu trả lời cho: ${q.label}`,
          });
        }

        if (!q.options.includes(found.value)) {
          return res.status(400).json({
            success: false,
            message: `Giá trị không hợp lệ cho câu hỏi: ${q.label}`,
          });
        }
      }
    }

    /* ===== UPSERT REVIEW (1 USER = 1 REVIEW) ===== */
    const review = await CourseReview.findOneAndUpdate(
      {
        course_id: courseId,
        user_id: userId,
      },
      {
        rating,
        satisfaction,
        comment,
        answers,
      },
      {
        upsert: true,
        new: true,
      }
    );

    /* ===== UPDATE COURSE RATING AVERAGE ===== */
    const stats = await CourseReview.aggregate([
      {
        $match: {
          course_id: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: "$course_id",
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    if (stats.length) {
      await Course.findByIdAndUpdate(courseId, {
        rating_average: Math.round(stats[0].avgRating * 10) / 10,
      });
    }

    return res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("submitCourseReview error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

/**
 * GET my review (user)
 */
const getMyCourseReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid courseId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const review = await CourseReview.findOne({
      course_id: courseId,
      user_id: userId,
    }).lean();

    return res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("getMyCourseReview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get review",
    });
  }
};

module.exports = {
  getAllCourseReviews,
  getReviewForm,
  updateReviewForm,
  submitCourseReview,
  getMyCourseReview,
};
