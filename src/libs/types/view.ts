import { Types } from "mongoose";
import { ViewGroup } from "../enum/view.enum";

export interface View {
  _id: Types.ObjectId;
  viewGroup: ViewGroup;
  memberId: Types.ObjectId;
  viewRefId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface ViewInput {
  memberId: Types.ObjectId | null;
  viewRefId: Types.ObjectId;
  viewGroup: ViewGroup;
}
