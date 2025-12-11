const express = require("express");
const router = express.Router();
const paymentCartController = require("../controllers/PaymentCartController");

// === Tạo URL thanh toán ===
router.post("/create", paymentCartController.createPaymentUrl);

// === Xử lý khi VNPay redirect về FE ===
router.get("/payment-return", paymentCartController.vnpayReturn);

module.exports = router;
