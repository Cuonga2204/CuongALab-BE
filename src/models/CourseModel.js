const mongoose = require("mongoose");
const { COURSE_CATEGORIES } = require("../constants/course.constants");

const CourseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: Object.values(COURSE_CATEGORIES),
      required: true,
    },

    title: { type: String, required: true },
    avatar: { type: String },

    price_current: { type: Number, required: true },
    price_old: { type: Number, required: true },

    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating_average: { type: Number, default: 0 },
    overview: { type: String },
    description: { type: String },

    student_count: { type: Number, default: 0 },
    total_sections: { type: Number, default: 0 },
    total_lectures: { type: Number, default: 0 },
    total_video_duration: { type: Number, default: 0 },
    name_teacher: { type: String },

    /* ====== 🔥 NEW: PRICING INFO LƯU TRONG COURSE ====== */
    discount_percent: { type: Number, default: 0 },
    discount_tag: { type: String, default: null },

    is_discount_active: { type: Boolean, default: false },

    sale_start: { type: Date, default: null },
    sale_end: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

CourseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
CourseSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Course = mongoose.model("Course", CourseSchema);
module.exports = Course;
