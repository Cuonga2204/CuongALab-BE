const mongoose = require("mongoose");

/* ===== ADMIN CUSTOM QUESTION ===== */
const ReviewQuestionSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true, // dùng làm key mapping FE <-> BE
    },
    label: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { _id: false }
);

/* ===== REVIEW FORM (ADMIN CONFIG) ===== */
const ReviewFormSchema = new mongoose.Schema(
  {
    questions: [ReviewQuestionSchema],
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

/* ===== USER REVIEW ===== */
const ReviewAnswerSchema = new mongoose.Schema(
  {
    question_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    value: String,
  },
  { _id: false }
);

const CourseReviewSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: Number,
    satisfaction: Boolean,
    comment: String,
    answers: [ReviewAnswerSchema],
  },
  { timestamps: true }
);

/* 1 user chỉ review 1 lần / course */
CourseReviewSchema.index({ course_id: 1, user_id: 1 }, { unique: true });

ReviewQuestionSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
ReviewQuestionSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
ReviewFormSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
CourseReviewSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
CourseReviewSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = {
  ReviewForm: mongoose.model("ReviewForm", ReviewFormSchema),
  CourseReview: mongoose.model("CourseReview", CourseReviewSchema),
};
