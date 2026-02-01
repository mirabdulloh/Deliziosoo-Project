import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
      index: true,
    },

    type: {
      type: String,
      enum: ["admin-reply", "low-rating", "update-requested", "order-status"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    reviewId: {
      type: Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for fast queries of unread notifications
notificationSchema.index({ memberId: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
