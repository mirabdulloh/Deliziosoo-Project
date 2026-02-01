import { Types } from "mongoose";
import Errors, { HttpCode, Message } from "../libs/Errors";

import ReviewModel from "../schema/Review.model";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import ReviewMessageModel from "../schema/ReviewMessage";
import ProductModel from "../schema/Product.model";
import MemberModel from "../schema/Member.model";
import { getSocketService } from "./socket.service";

import {
  CreateReviewInput,
  UpdateReviewInput,
  AdminReviewActionInput,
  ProductReviewQuery,
  TopReviewQuery,
} from "../libs/types/review";
import { Member, ExtendedRequest, AdminRequest } from "../libs/types/member";

class ReviewService {
  private readonly reviewModel;
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly reviewMessageModel;

  constructor() {
    this.reviewModel = ReviewModel;
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.reviewMessageModel = ReviewMessageModel;
  }

  public async createReview(member: Member, input: CreateReviewInput) {
    try {
      if (!member?._id)
        throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

      const { orderId, productId, rating, comment } = input;

      if (!orderId)
        throw new Errors(HttpCode.BAD_REQUEST, Message.ORDER_ID_REQUIRED);
      if (!productId)
        throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_ID_REQUIRED);

      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ACTION);
      }

      const order = await this.orderModel.findById(orderId).lean();
      if (!order) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

      if (String(order.memberId) !== String(member._id)) {
        throw new Errors(HttpCode.FORBIDDEN, Message.FORBIDDEN);
      }

      if (order.orderStatus !== "FINISH") {
        throw new Errors(HttpCode.BAD_REQUEST, Message.ORDER_NOT_FINISHED);
      }

      const orderItem = await this.orderItemModel
        .findOne({
          orderId: new Types.ObjectId(String(orderId)),
          productId: new Types.ObjectId(String(productId)),
        })
        .lean();

      if (!orderItem)
        throw new Errors(HttpCode.BAD_REQUEST, Message.PRODUCT_NOT_FOUND);

      const editableUntil = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

      const doc = await this.reviewModel.create({
        memberId: member._id,
        orderId,
        productId,
        rating,
        comment,
        isLowRating: rating <= 2,
        status: "PUBLISHED",
        editableUntil,
      });

      // Send socket notification if low rating
      if (rating <= 2) {
        try {
          const socketService = getSocketService();
          const product = await ProductModel.findById(productId).lean();
          socketService.notifyAdminLowRating({
            reviewId: doc._id.toString(),
            memberId: member._id.toString(),
            memberNick: member.memberNick || "Unknown",
            productName: product?.productName || "Unknown Product",
            rating,
            comment,
          });
        } catch (socketErr) {
          console.log("Socket notification error (non-critical):", socketErr);
        }
      }

      return doc;
    } catch (err: any) {
      if (err?.code === 11000)
        throw new Errors(HttpCode.BAD_REQUEST, Message.REVIEW_ALREADY_EXISTS);
      throw err;
    }
  }

  public async updateReview(member: Member, input: UpdateReviewInput) {
    if (!member?._id)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

    const { reviewId, rating, comment } = input;
    if (!reviewId)
      throw new Errors(HttpCode.BAD_REQUEST, Message.REVIEW_ID_REQUIRED);

    if (
      rating !== undefined &&
      (typeof rating !== "number" || rating < 1 || rating > 5)
    ) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ACTION);
    }

    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new Errors(HttpCode.NOT_FOUND, Message.REVIEW_NOT_FOUND);

    if (String(review.memberId) !== String(member._id)) {
      throw new Errors(HttpCode.FORBIDDEN, Message.FORBIDDEN);
    }

    const now = Date.now();
    const until = review.editableUntil
      ? new Date(review.editableUntil).getTime()
      : 0;
    const canEdit =
      review.adminRequestedUpdate === true || (until && now <= until);
    if (!canEdit)
      throw new Errors(HttpCode.BAD_REQUEST, Message.EDIT_TIME_EXPIRED);

    if (typeof rating === "number") {
      review.rating = rating;
      review.isLowRating = rating <= 2;
    }
    if (typeof comment === "string") review.comment = comment;

    review.lastEditedAt = new Date();
    review.editCount = (review.editCount || 0) + 1;
    review.adminRequestedUpdate = false;

    await review.save();
    return review;
  }

  public async getMyReviews(member: Member) {
    if (!member?._id)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

    return this.reviewModel
      .find({ memberId: member._id })
      .sort({ createdAt: -1 })
      .populate("productId")
      .lean();
  }

  public async getProductReviews(
    params: { productId: string },
    query: ProductReviewQuery,
  ) {
    const { productId } = params;
    const page = Math.max(Number(query.page || 1), 1);
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 50);
    const skip = (page - 1) * limit;

    const match = {
      productId: new Types.ObjectId(productId),
      status: "PUBLISHED",
    };

    const [items, total] = await Promise.all([
      this.reviewModel
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("memberId", "memberNick memberImage")
        .lean(),
      this.reviewModel.countDocuments(match),
    ]);

    return { items, total, page, limit };
  }

  public async getTopReviews(query: TopReviewQuery) {
    const limit = Math.min(Math.max(Number(query.limit || 10), 1), 20);
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return this.reviewModel
      .find({
        status: "PUBLISHED",
        createdAt: { $gte: since },
        rating: { $gte: 4 },
      })
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .populate("memberId", "memberNick memberImage")
      .populate("productId", "productName productImages")
      .lean();
  }
  public async getReviewMessages(member: any, reviewId: string) {
    if (!member?._id)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

    const review = await this.reviewModel.findById(reviewId).lean();
    if (!review) throw new Errors(HttpCode.NOT_FOUND, Message.REVIEW_NOT_FOUND);

    // ✅ only owner can read
    if (String(review.memberId) !== String(member._id)) {
      throw new Errors(HttpCode.FORBIDDEN, Message.FORBIDDEN);
    }

    const messages = await ReviewMessageModel.find({ reviewId })
      .sort({ createdAt: 1 })
      .lean();

    // optional: mark messages read by member
    await ReviewMessageModel.updateMany(
      { reviewId, senderType: "ADMIN", isRead: false },
      { $set: { isRead: true } },
    );

    return messages;
  }
  //   ! ADMIN METHODS
  public async listReviews() {
    return this.reviewModel
      .find()
      .sort({ createdAt: -1 })
      .populate("memberId", "memberNick memberEmail memberPhone")
      .populate("productId", "productName productImages")
      .populate("orderId", "orderStatus createdAt")
      .lean();
  }

  public async adminAction(admin: Member, input: AdminReviewActionInput) {
    if (!admin?._id)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.UNAUTHORIZED);

    const { reviewId, action, message } = input;
    const rid =
      typeof reviewId === "string" ? reviewId : String(reviewId || "");
    if (!Types.ObjectId.isValid(rid)) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.REVIEW_ID_REQUIRED);
    }

    const review = await this.reviewModel.findById(rid);

    if (!review) throw new Errors(HttpCode.NOT_FOUND, Message.REVIEW_NOT_FOUND);

    if (action === "HIDE") {
      review.status = "HIDDEN";
      await review.save();
      return review;
    }

    if (action === "SHOW") {
      review.status = "PUBLISHED";
      await review.save();
      return review;
    }

    if (action === "REQUEST_UPDATE") {
      review.adminRequestedUpdate = true;
      review.editableUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await review.save();

      // Send socket notification
      try {
        const socketService = getSocketService();
        socketService.notifyReviewUpdateRequest(
          review.memberId.toString(),
          reviewId.toString(),
        );
      } catch (socketErr) {
        console.log("Socket notification error (non-critical):", socketErr);
      }

      return review;
    }

    if (action === "REPLY") {
      if (!message)
        throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

      // create private message
      const msg = await ReviewMessageModel.create({
        reviewId,
        senderType: "ADMIN",
        senderId: admin._id,
        message,
        isReadByAdmin: true,
        isReadByMember: false,
      });

      // Send socket notification to user
      try {
        const socketService = getSocketService();
        socketService.notifyAdminReply(
          review.memberId.toString(),
          reviewId.toString(),
          message,
        );
      } catch (socketErr) {
        console.log("Socket notification error (non-critical):", socketErr);
      }

      return msg;
    }

    throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ACTION);
  }
}

export default ReviewService;
