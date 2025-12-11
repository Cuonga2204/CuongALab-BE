const mongoose = require("mongoose");

const VideoQuizSchema = new mongoose.Schema(
  {
    lecture_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    time_in_seconds: { type: Number, required: true },
    question: { type: String, required: true },
    options: [
      {
        text: String,
        is_correct: String,
      },
    ],
  },
  { timestamps: true }
);

VideoQuizSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;

    if (ret.options && Array.isArray(ret.options)) {
      ret.options = ret.options.map((opt) => ({
        id: opt._id,
        text: opt.text,
        is_correct: opt.is_correct,
      }));
    }

    return ret;
  },
});

const VideoQuiz = mongoose.model("VideoQuiz", VideoQuizSchema);
module.exports = VideoQuiz;
