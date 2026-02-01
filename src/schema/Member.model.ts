import mongoose, { Schema } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enum/member.enum";
import { Member } from "../libs/types/member";

const memberSchema = new Schema(
  {
    memberType: {
      type: String,
      enum: MemberType,
      default: MemberType.USER,
    },
    memberStatus: {
      type: String,
      enum: MemberStatus,
      default: MemberStatus.ACTIVE,
    },
    memberNick: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPhone: {
      type: String,
      index: { unique: true, sparse: true },
      required: true,
    },
    memberPassword: {
      type: String,
      select: false,
      required: true,
    },
    memberAddress: {
      type: String,
    },
    memberDesc: {
      type: String,
    },
    memberEmail: {
      type: String,
    },
    memberImage: {
      type: String,
    },
    memberPoints: {
      type: Number,
      default: 0,
    },
    memberCoupon: {
      code: { type: String, default: null },
      discount: { type: Number, default: 5 },
      isUsed: { type: Boolean, default: false },
      expiresAt: { type: Date, default: null },
    },
    lastActiveAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Member", memberSchema);
