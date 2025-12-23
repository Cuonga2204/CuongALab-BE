const mongoose = require("mongoose");
const { USER_COURSE_STATUS } = require("../constants/userCourse.constants");

const UserCourseSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(USER_COURSE_STATUS),
      default: USER_COURSE_STATUS.IN_PROGRESS,
    },

    // ⭐ PROGRESS %
    progress: {
      type: Number,
      default: 0,
    },

    last_access_at: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

UserCourseSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

UserCourseSchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

const UserCourse = mongoose.model("UserCourse", UserCourseSchema);
module.exports = UserCourse;
