const express = require("express");
const router = express.Router();
const paymentSingleController = require("../controllers/PaymentCourseController");

// Tạo link thanh toán 1 khóa học
router.post("/create", paymentSingleController.createPaymentCourse);

// VNPay callback
router.get("/payment-return", paymentSingleController.vnpayReturnSingle);

module.exports = router;
