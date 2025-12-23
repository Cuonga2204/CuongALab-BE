const mongoose = require("mongoose");

const QuestionBankSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },

    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    questions: [
      {
        question: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            is_correct: { type: Boolean, default: false },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);
QuestionBankSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
QuestionBankSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("QuestionBank", QuestionBankSchema);
