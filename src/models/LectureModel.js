const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema(
  {
    section_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },

    // ⭐ MUST HAVE — THÊM VÀO ĐỂ FIX LỖI
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    lecture_title: { type: String, required: true },
    video: { type: String, required: false },
    duration: { type: Number, default: 0 },
    transcript: { type: String, default: "" },
    captions_url: { type: String, default: "" },
    position_in_section: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

LectureSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Lecture", LectureSchema);
