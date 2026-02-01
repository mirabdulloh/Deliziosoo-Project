import mongoose, { Schema } from "mongoose";

const reviewMessageSchema = new Schema(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "review",
    },
    senderType: {
      type: String,
      enum: ["ADMIN", "MEMBER"],
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "senderTypeRef",
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// fast fetch messages for a review
reviewMessageSchema.index({ reviewId: 1, createdAt: 1 });

export default mongoose.model("ReviewMessage", reviewMessageSchema);
