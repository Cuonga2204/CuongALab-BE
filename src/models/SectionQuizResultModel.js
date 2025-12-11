const mongoose = require("mongoose");

const SectionQuizResultSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    section_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    section_quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionQuiz",
      required: true,
    },

    correct_count: Number,
    total_questions: Number,
    percentage: Number,
    is_passed: Boolean,
    submitted_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SectionQuizResultSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
SectionQuizResultSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("SectionQuizResult", SectionQuizResultSchema);
