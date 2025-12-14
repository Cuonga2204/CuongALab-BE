const {
  VNPay,
  VnpLocale,
  ProductCode,
  dateFormat,
  ignoreLogger,
} = require("vnpay");
require("dotenv").config();
const Cart = require("../models/CartModel");
const UserCourse = require("../models/UserCourseModel");
const Course = require("../models/CourseModel");
const Payment = require("../models/PaymentModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

const createPaymentUrl = async (req, res) => {
  try {
    const { cartId } = req.body;
    const cart = await Cart.findById(cartId);
    // === Cấu hình VNPay Sandbox ===

    const vnpay = new VNPay({
      tmnCode: process.env.VNP_TMN_CODE,
      secureSecret: process.env.VNP_HASH_SECRET,
      vnpayHost: process.env.VNP_URL,
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger, // tắt log của lib
    });

    // === Tạo URL thanh toán ===
    const vnpayUrlResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: cart.totalPrice,
      vnp_IpAddr: "127.0.0.1",
      vnp_TxnRef: `CART_ORDER_${cartId}`,
      vnp_OrderInfo: "Thanh toan gio hang",
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: process.env.VNP_RETURN_URL_CART,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
    });

    return successHandler(res, vnpayUrlResponse);
  } catch {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * ==============================
 * 2️⃣ Khi VNPay redirect về
 * ==============================
 */
const vnpayReturn = async (req, res) => {
  try {
    const query = req.query;
    const responseCode = query.vnp_ResponseCode;
    const orderId = query.vnp_TxnRef;
    const cartId = orderId.replace("CART_ORDER_", "");

    // ✅ 1. Nếu thanh toán thành công
    if (responseCode === "00" && cartId) {
      const cart = await Cart.findById(cartId).populate("items");
      if (!cart) {
        return res.redirect("${process.env.LOCAL_HOST_FE}/payment-failed");
      }

      for (const course of cart.items) {
        const exists = await UserCourse.findOne({
          user_id: cart.user_id,
          course_id: course._id.toString(),
        });

        if (!exists) {
          await UserCourse.create({
            user_id: cart.user_id,
            course_id: course._id,
          });

          await Course.findByIdAndUpdate(course._id.toString(), {
            $inc: { student_count: 1 },
          });
        }
      }

      await Cart.findByIdAndDelete(cartId);

      await Payment.create({
        order_id: orderId,
        user_id: cart.user_id,
        type: "cart",
        amount: cart.totalPrice,
        status: "success",
        cart_id: cartId,
      });

      return res.redirect(
        `${process.env.LOCAL_HOST_FE}/payment-success?orderId=${orderId}`
      );
    }

    return res.redirect(`${process.env.LOCAL_HOST_FE}/payment-failed`);
  } catch {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR);
  }
};

module.exports = { createPaymentUrl, vnpayReturn };
