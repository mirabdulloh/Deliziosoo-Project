import mongoose, { Schema } from "mongoose";
import { LikeGroup } from "../libs/enum/view.enum";

const likesSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    likeGroup: {
      type: String,
      enum: Object.values(LikeGroup),
      required: true,
    },
  },
  { timestamps: true },
);

// Compound index for unique likes per member per entity
likesSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

// Index for efficient lookups when fetching products with like status
likesSchema.index({ likeRefId: 1, memberId: 1, likeGroup: 1 });

// Index for fetching all likes by member
likesSchema.index({ memberId: 1, likeGroup: 1, createdAt: -1 });

export default mongoose.model("Likes", likesSchema);
