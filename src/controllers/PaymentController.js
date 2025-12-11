const Payment = require("../models/PaymentModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors");

const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const total = await Payment.countDocuments();
    const payments = await Payment.find()
      .populate("user_id", "name email")
      .populate("course_id", "title")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const formatted = payments.map((p) => ({
      id: p.id,
      order_id: p.order_id,
      amount: p.amount,
      status: p.status,
      type: p.type,
      createdAt: p.createdAt,
      paymentUser: p.user_id, // đổi tên
      paymentCourse: p.course_id, // đổi tên
    }));

    return successHandler(res, {
      payments: formatted,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (e) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, e.message);
  }
};

const getPaymentDetail = async (req, res) => {
  try {
    const item = await Payment.findById(req.params.id)
      .populate("user_id", "id name email")
      .populate("course_id", "id title price_current");

    if (!item) return errorHandler(res, ERRORS.NOT_FOUND);

    const formatted = {
      id: item.id,
      order_id: item.order_id,
      amount: item.amount,
      type: item.type,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,

      paymentUser: item.user_id,
      paymentCourse: item.course_id || null,
    };

    return successHandler(res, formatted);
  } catch (e) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, e.message);
  }
};
const deletePayment = async (req, res) => {
  try {
    const item = await Payment.findByIdAndDelete(req.params.id);
    if (!item) return errorHandler(res, ERRORS.NOT_FOUND);

    return successHandler(res, item);
  } catch (e) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, e.message);
  }
};

module.exports = { getAllPayments, getPaymentDetail, deletePayment };
