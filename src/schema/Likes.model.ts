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

likesSchema.index({ memberId: 1, likeRefId: 1 }, { unique: true });

export default mongoose.model("Likes", likesSchema);
