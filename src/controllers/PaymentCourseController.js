const {
  VNPay,
  VnpLocale,
  ProductCode,
  dateFormat,
  ignoreLogger,
} = require("vnpay");

const UserCourse = require("../models/UserCourseModel");
const Course = require("../models/CourseModel");
const Payment = require("../models/PaymentModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

require("dotenv").config();

/**
 * ===========================================
 * 1️⃣ Tạo URL thanh toán khóa học lẻ
 * ===========================================
 */
const createPaymentCourse = async (req, res) => {
  try {
    const { userId, courseId, price } = req.body;

    // Check khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) return errorHandler(res, ERRORS.COURSE_NOT_FOUND);

    // Nếu FE truyền sai giá → dùng giá trên DB
    const amount = price ?? course.price_current;

    const vnpay = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: process.env.VNP_URL,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const txnRef = `COURSE_ORDER_${courseId}_${userId}_${Date.now()}`;

    const vnpayUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: "127.0.0.1",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toán khóa học ${courseId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL_COURSE,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
    });

    return successHandler(res, { paymentUrl: vnpayUrl });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * ===========================================
 * 2️⃣ Callback sau khi thanh toán
 * ===========================================
 */
const vnpayReturnSingle = async (req, res) => {
  try {
    const { vnp_ResponseCode, vnp_TxnRef } = req.query;

    // ❌ Thanh toán thất bại
    if (vnp_ResponseCode !== "00") {
      return res.redirect(`${process.env.LOCAL_HOST_FE}/payment-failed`);
    }

    // Chuỗi format: COURSE_ORDER_<courseId>_<userId>_<timestamp>
    const parts = vnp_TxnRef.split("_");
    const courseId = parts[2];
    const userId = parts[3];

    if (!courseId || !userId) {
      return res.redirect(`${process.env.LOCAL_HOST_FE}/payment-failed`);
    }

    // Check user đã mua trước đó chưa
    const exists = await UserCourse.findOne({
      user_id: userId,
      course_id: courseId,
    });

    if (!exists) {
      await UserCourse.create({
        user_id: userId,
        course_id: courseId,
      });

      // Tăng tổng số học viên
      await Course.findByIdAndUpdate(courseId, {
        $inc: { student_count: 1 },
      });
    }
    const course = await Course.findById(courseId);
    await Payment.create({
      order_id: vnp_TxnRef,
      user_id: userId,
      type: "single",
      amount: course.price_current,
      status: "success",
      course_id: courseId,
    });

    return res.redirect(
      `${process.env.LOCAL_HOST_FE}/payment-success?orderId=${vnp_TxnRef}`
    );
  } catch {
    return res.redirect(`${process.env.LOCAL_HOST_FE}/payment-failed`);
  }
};

module.exports = {
  createPaymentCourse,
  vnpayReturnSingle,
};
