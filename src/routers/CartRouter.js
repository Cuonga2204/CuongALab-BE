const express = require("express");
const router = express.Router();
const cartController = require("../controllers/CartController");

// 🔹 Lấy giỏ hàng của user
router.get("/:userId", cartController.getUserCart);

// 🔹 Thêm khóa học vào giỏ
router.post("/add", cartController.addToCart);

// 🔹 Xóa 1 khóa học khỏi giỏ
router.delete("/remove", cartController.removeFromCart);

// 🔹 Xóa toàn bộ giỏ hàng của user

module.exports = router;
