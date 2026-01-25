import { LikeGroup } from "../enum/view.enum";
import { Types } from "mongoose";

export interface LikeInput {
  memberId: Types.ObjectId;
  likeRefId: Types.ObjectId;
  likeGroup: LikeGroup;
}
