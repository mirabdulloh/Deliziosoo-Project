import { Types } from "mongoose";

export interface CreateReviewMessageInput {
  reviewId: string | Types.ObjectId;
  message: string;
}

export interface GetReviewMessagesQuery {
  reviewId: string;
}
