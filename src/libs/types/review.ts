import { Types } from "mongoose";

/* ==================================================
   SPA INPUTS
================================================== */

// create review
export interface CreateReviewInput {
  orderId: string | Types.ObjectId;
  productId: string | Types.ObjectId;
  rating: number;
  comment?: string;
}

// update review
export interface UpdateReviewInput {
  reviewId: string | Types.ObjectId;
  rating?: number;
  comment?: string;
}


/* ==================================================
   PUBLIC QUERIES
================================================== */

export interface ProductReviewQuery {
  page?: number | string;
  limit?: number | string;
}

export interface TopReviewQuery {
  limit?: number | string;
}


/* ==================================================
   ADMIN INPUTS
================================================== */

export type AdminReviewActionType =
  | "HIDE"
  | "SHOW"
  | "REQUEST_UPDATE"
  | "REPLY";

export interface AdminReviewActionInput {
  reviewId: string | Types.ObjectId;
  action: AdminReviewActionType;
  message?: string; // only for REPLY
}


/* ==================================================
   SERVICE PARAMS (optional but nice)
================================================== */

export interface MemberContext {
  _id: Types.ObjectId;
}

export interface AdminContext {
  _id: Types.ObjectId;
}


/* ==================================================
   SERVICE RETURNS (optional strong typing)
================================================== */

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
