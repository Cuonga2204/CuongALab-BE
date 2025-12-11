const mongoose = require("mongoose");

const SectionQuizSchema = new mongoose.Schema(
  {
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

    title: { type: String, required: true },
    position_in_section: { type: Number, default: 1 },
    passing_percentage: { type: Number, default: 80 },
  },
  { timestamps: true }
);

SectionQuizSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

SectionQuizSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("SectionQuiz", SectionQuizSchema);
