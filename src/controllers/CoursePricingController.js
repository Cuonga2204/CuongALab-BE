const CoursePricing = require("../models/CoursePricingModel");
const Course = require("../models/CourseModel");

const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

/* =====================================================
   CREATE OR UPDATE PRICING
===================================================== */
const updatePricing = async (req, res) => {
  try {
    const {
      id, // pricing id
      course_id,
      base_price,
      sale_price,
      discount_percent,
      discount_tag,
      is_discount_active,
      sale_start,
      sale_end,
    } = req.body;

    if (!course_id) {
      return errorHandler(res, ERRORS.VALIDATION, "course_id is required");
    }

    let pricing = null;

    // Nếu có id → UPDATE
    if (id) {
      pricing = await CoursePricing.findById(id);
      if (!pricing) return errorHandler(res, ERRORS.NOT_FOUND);
    }

    // Nếu không có → CREATE
    if (!pricing) {
      pricing = new CoursePricing({ course_id });
    }

    // Gán dữ liệu vào pricing
    Object.assign(pricing, {
      base_price,
      sale_price,
      discount_percent,
      discount_tag,
      is_discount_active,
      sale_start,
      sale_end,
    });

    await pricing.save();

    // ====================================
    // 🔥 UPDATE COURSE (THÊM 5 TRƯỜNG MỚI)
    // ====================================
    await Course.findByIdAndUpdate(course_id, {
      price_old: base_price,
      price_current: sale_price,

      // Cập nhật 5 trường discount
      discount_percent,
      discount_tag,
      is_discount_active,
      sale_start,
      sale_end,
    });

    return successHandler(res, pricing);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   GET PRICING BY COURSE_ID
===================================================== */
const getPricingByCourse = async (req, res) => {
  try {
    const pricing = await CoursePricing.findOne({
      course_id: req.params.courseId,
    });

    return successHandler(res, pricing || null);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/* =====================================================
   GET ALL PRICINGS
===================================================== */
const getAllPricing = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      Course.find().skip(skip).limit(limit),
      Course.countDocuments(),
    ]);

    const pricings = await CoursePricing.find({
      course_id: { $in: courses.map((c) => c._id) },
    });

    const data = courses.map((course) => {
      const pricing = pricings.find(
        (p) => p.course_id.toString() === course.id
      );

      return {
        course: course.toJSON(),
        pricing: pricing ? pricing.toJSON() : null,
      };
    });

    return successHandler(res, {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};
/* =====================================================
   OTHER FUNCTIONS
===================================================== */

const increaseViewCount = async (req, res) => {
  try {
    const pricing = await CoursePricing.findOne({
      course_id: req.params.courseId,
    });

    if (!pricing)
      return errorHandler(res, ERRORS.NOT_FOUND, "Pricing not found");

    pricing.view_count += 1;
    await pricing.save();

    return successHandler(res, pricing);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

const increasePurchasedCount = async (req, res) => {
  try {
    const pricing = await CoursePricing.findOne({
      course_id: req.params.courseId,
    });

    if (!pricing)
      return errorHandler(res, ERRORS.NOT_FOUND, "Pricing not found");

    pricing.purchased_count += 1;
    await pricing.save();

    return successHandler(res, pricing);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  updatePricing,
  getPricingByCourse,
  getAllPricing,
  increaseViewCount,
  increasePurchasedCount,
};
