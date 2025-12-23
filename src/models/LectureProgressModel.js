const mongoose = require("mongoose");

const LectureProgressSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    course_id: { type: String, required: true },
    section_id: { type: String, required: true },
    lecture_id: { type: String, required: true },

    watched_seconds: { type: Number, default: 0 },
    percentage_watched: { type: Number, default: 0 },
    is_completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LectureProgressSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("LectureProgress", LectureProgressSchema);
