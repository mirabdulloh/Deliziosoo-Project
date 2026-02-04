import session, { Session } from "express-session";
import { MemberStatus, MemberType } from "../enum/member.enum";
import { Types } from "mongoose";
import { Request } from "express";

export interface Coupon {
  code: string | null;
  discount: number;
  isUsed: boolean;
  expiresAt: Date | null;
}

export interface Member {
  _id: Types.ObjectId;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
  memberEmail?: string;
  memberPoints: number;
  totalOrders?: number;
  memberCoupon?: Coupon;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date | null;
  lastLoginAt?: Date | null;
}

export interface MemberInput {
  memberType?: MemberType;
  memberStatus?: MemberStatus;
  memberNick: string;
  memberPhone: string;
  memberPassword: string;
  memberAddress?: string;
  memberDesc?: string;
  memberEmail?: string;
  memberPoints?: number;
  memberImage?: string;
}

export interface memberUpdateInput {
  _id: Types.ObjectId;
  memberStatus?: MemberStatus;
  memberNick?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberPassword?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberImage?: string;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface ExtendedRequest extends Request {
  member?: Member;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

export interface AdminRequest extends Request {
  member: Member;
  session: Session & { member: Member };
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
