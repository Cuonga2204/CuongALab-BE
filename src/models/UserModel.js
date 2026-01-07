const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "user", required: true },
    avatar: { type: String },
    phone: { type: Number },
    /* ===== ONBOARDING ===== */
    learning_profile: {
      role: String,
      goals: [String],
      raw_interests: [String],
      description: String,
      level: String,
      category_root: {
        type: String, // vd: "ai", "web", "backend"
        index: true,
      },
    },

    has_onboarding: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
// 🧩 Chuyển _id -> id khi trả về JSON
UserSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
const User = mongoose.model("User", UserSchema);
module.exports = User;
