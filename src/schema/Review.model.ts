import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },

    productId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    },

    orderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    // for low rating alert (admin notifications)
    isLowRating: {
      type: Boolean,
      default: false,
    },

    // admin can hide toxic/spam reviews
    status: {
      type: String,
      enum: ["PUBLISHED", "HIDDEN"],
      default: "PUBLISHED",
    },

    // user editing
    editableUntil: {
      type: Date,
    },

    adminRequestedUpdate: {
      type: Boolean,
      default: false,
    },

    lastEditedAt: {
      type: Date,
    },

    editCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

/* =========================
   INDEXES (VERY IMPORTANT)
========================= */

// only ONE review per order+product+member
reviewSchema.index({ memberId: 1, orderId: 1, productId: 1 }, { unique: true });

// fast homepage queries
reviewSchema.index({ rating: -1, createdAt: -1 });
reviewSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
