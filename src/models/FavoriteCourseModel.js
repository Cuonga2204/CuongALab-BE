const mongoose = require("mongoose");

const FavoriteCourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  },
  { timestamps: true }
);

FavoriteCourseSchema.index({ userId: 1, courseId: 1 }, { unique: true });

FavoriteCourseSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});
FavoriteCourseSchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

const FavoriteCourse = mongoose.model("FavoriteCourse", FavoriteCourseSchema);
module.exports = FavoriteCourse;
