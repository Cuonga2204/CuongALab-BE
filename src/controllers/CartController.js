const Cart = require("../models/CartModel");
const Course = require("../models/CourseModel");
const { successHandler, errorHandler } = require("../utils/ResponseHandle");
const { ERRORS } = require("../errors/index");

/**
 * 🟢 GET /api/cart/:userId
 * Lấy giỏ hàng của user + tính tổng tiền & tổng số lượng khóa học
 */
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Tìm hoặc tạo mới giỏ hàng
    const cart =
      (await Cart.findOne({ user_id: userId }).populate({
        path: "items",
        model: "Course",
      })) ||
      (await Cart.create({
        user_id: userId,
        items: [],
        totalQuantity: 0,
        totalPrice: 0,
      }));

    // Chuẩn hóa dữ liệu FE cần
    const items = cart.items.map((course) => course.toJSON());
    const totalQuantity = items.length;
    const totalPrice = items.reduce(
      (sum, course) => sum + (course.price_current || 0),
      0
    );

    // Cập nhật lại giỏ hàng (sync dữ liệu)
    cart.totalQuantity = totalQuantity;
    cart.totalPrice = totalPrice;
    await cart.save();
    return successHandler(res, cart);
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * 🟡 POST /api/cart/add
 * Thêm khóa học vào giỏ hàng (mỗi khóa học chỉ có 1)
 */
const addToCart = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      return errorHandler(res, ERRORS.COURSE_NOT_FOUND, "Course not found");
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user_id: userId });
    if (!cart)
      cart = await Cart.create({
        user_id: userId,
        items: [],
        quantity: 0,
        totalPrice: 0,
      });

    // Nếu khóa học đã có -> không thêm lại
    const exists = cart.items.find((item) => item.toString() === courseId);
    if (exists) {
      return successHandler(res, "Course already in cart");
    }

    // Thêm khóa học mới
    cart.items.push(courseId);

    // Tính lại tổng
    cart.quantity = cart.items.length;
    const courses = await Course.find({ _id: { $in: cart.items } });
    cart.totalPrice = courses.reduce(
      (sum, c) => sum + (c.price_current || 0),
      0
    );

    await cart.save();
    return successHandler(res, "Added to cart successfully");
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * 🔴 DELETE /api/cart/remove
 * Xoá 1 khóa học khỏi giỏ hàng
 * body: { userId, courseId }
 */
const removeFromCart = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return errorHandler(res, ERRORS.CART_NOT_FOUND);

    // Lọc bỏ khóa học bị xóa
    cart.items = cart.items.filter((i) => i.toString() !== courseId);

    // Cập nhật lại tổng
    cart.quantity = cart.items.length;
    const courses = await Course.find({ _id: { $in: cart.items } });
    cart.totalPrice = courses.reduce(
      (sum, c) => sum + (c.price_current || 0),
      0
    );

    await cart.save();

    return successHandler(res, "Removed from cart");
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * 🗑️ DELETE /api/cart/clear/:userId
 * Xóa toàn bộ giỏ hàng của user
 */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) return errorHandler(res, ERRORS.CART_NOT_FOUND);

    cart.items = [];
    cart.quantity = 0;
    cart.totalPrice = 0;
    await cart.save();

    return successHandler(res, { items: [], totalQuantity: 0, totalPrice: 0 });
  } catch (error) {
    return errorHandler(res, ERRORS.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  getUserCart,
  addToCart,
  removeFromCart,
  clearCart,
};
