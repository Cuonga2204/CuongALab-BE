const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    order_id: { type: String, required: true }, // vnp_TxnRef
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["single", "cart"], required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["success", "failed"], required: true },

    // thanh toán 1 khóa học
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },

    // thanh toán giỏ hàng
    cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
  },
  { timestamps: true }
);

PaymentSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

PaymentSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Payment", PaymentSchema);
