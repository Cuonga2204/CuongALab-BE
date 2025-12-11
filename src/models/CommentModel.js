const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    lecture_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: { type: String, required: true },

    likes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👈 NEW
    ],
  },
  { timestamps: true }
);

CommentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
