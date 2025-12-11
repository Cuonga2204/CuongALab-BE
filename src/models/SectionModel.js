// src/models/SectionModel.js
const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    total_lectures: { type: Number, default: 0 },
    total_duration: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

SectionSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Section", SectionSchema);
