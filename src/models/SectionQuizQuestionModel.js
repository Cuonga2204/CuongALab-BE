const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  is_correct: { type: Boolean, default: false },
});

const SectionQuizQuestionSchema = new mongoose.Schema(
  {
    section_quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SectionQuiz",
      required: true,
    },

    question: { type: String, required: true },

    options: [OptionSchema],
  },
  { timestamps: true }
);

SectionQuizQuestionSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
SectionQuizQuestionSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
OptionSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
OptionSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model(
  "SectionQuizQuestion",
  SectionQuizQuestionSchema
);
