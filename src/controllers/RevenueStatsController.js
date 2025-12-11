const Payment = require("../models/PaymentModel");
const User = require("../models/UserModel");
const UserCourse = require("../models/UserCourseModel");
// const Course = require("../models/CourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");

const getRevenueStats = async (req, res) => {
  try {
    const { from, to } = req.query;

    const dateFilter = {};
    if (from && to) {
      dateFilter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    // 1. Lấy giao dịch thành công
    const successPayments = await Payment.find({
      status: "success",
      ...dateFilter,
    });

    const revenue = successPayments.reduce((sum, p) => sum + p.amount, 0);

    // 2. Tổng giao dịch
    const totalTransactions = successPayments.length;

    // 3. Tổng khóa học đã bán
    const courseSold = await UserCourse.countDocuments({
      ...dateFilter,
    });

    // 4. Tổng học viên mới
    const newUsers = await User.countDocuments({
      ...dateFilter,
    });

    // 5. Tăng trưởng doanh thu so với tháng trước
    const previousMonthStart = new Date();
    previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);
    previousMonthStart.setDate(1);

    const previousMonthEnd = new Date();
    previousMonthEnd.setDate(0);

    const oldPayments = await Payment.find({
      status: "success",
      createdAt: {
        $gte: previousMonthStart,
        $lte: previousMonthEnd,
      },
    });

    const oldRevenue = oldPayments.reduce((sum, p) => sum + p.amount, 0);

    const revenueGrowth =
      oldRevenue === 0 ? 100 : ((revenue - oldRevenue) / oldRevenue) * 100;

    return successHandler(res, {
      revenue,
      totalTransactions,
      courseSold,
      newUsers,
      revenueGrowth,
    });
  } catch (error) {
    return errorHandler(res, "INTERNAL_ERROR", error.message);
  }
};

module.exports = { getRevenueStats };
