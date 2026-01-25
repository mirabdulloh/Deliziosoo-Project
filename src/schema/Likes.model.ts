import mongoose, { Schema } from "mongoose";

const likesSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    likeRefId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("likes", likesSchema);
