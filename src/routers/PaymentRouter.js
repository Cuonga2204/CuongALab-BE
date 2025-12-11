const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/PaymentController");

router.get("/get-all", paymentController.getAllPayments);
router.get(
  "/detail/:id",

  paymentController.getPaymentDetail
);
router.delete(
  "/delete/:id",

  paymentController.deletePayment
);

module.exports = router;
