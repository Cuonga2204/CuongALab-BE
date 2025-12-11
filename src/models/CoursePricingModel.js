const mongoose = require("mongoose");

const CoursePricingSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },

    base_price: { type: Number, required: true },
    sale_price: { type: Number, required: true },

    discount_percent: { type: Number, default: 0 },
    discount_tag: { type: String },

    is_discount_active: { type: Boolean, default: false },

    sale_start: { type: Date, default: null },
    sale_end: { type: Date, default: null },

    view_count: { type: Number, default: 0 },
    purchased_count: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

module.exports = mongoose.model("CoursePricing", CoursePricingSchema);
