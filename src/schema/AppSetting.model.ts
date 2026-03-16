import mongoose, { Schema } from "mongoose";

const appSettingSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "global",
    },
    loyaltyRewardCouponEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("AppSetting", appSettingSchema);
