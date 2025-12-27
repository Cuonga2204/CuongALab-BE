const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null = level 1
    },
    root_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true, // ⭐ QUERY NHANH
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 4, // ⭐ CHỐT 4 LEVEL
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CategorySchema.set("toJSON", {
  virtual: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});
CategorySchema.set("toObject", {
  virtual: true,
  versionKey: false,
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

module.exports = mongoose.model("Category", CategorySchema);
