import { Request, Response } from "express";
import { T } from "../libs/types/common";
import ReviewService from "../models/Review.service";
import Errors, { HttpCode } from "../libs/Errors";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";

const reviewService = new ReviewService();
const reviewController: T = {};

/* ==================================================
   🔵 SPA (RAW JSON ONLY)
   res.json(result)
================================================== */

// create review
reviewController.createReview = async (req: ExtendedRequest, res: Response) => {
  try {
    const member = req.member;
    const input = req.body;

    const result = await reviewService.createReview(member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR createReview:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// update review
reviewController.updateReview = async (req: ExtendedRequest, res: Response) => {
  try {
    const member = req.member;
    const input = req.body;

    const result = await reviewService.updateReview(member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR updateReview:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// my reviews
reviewController.getMyReviews = async (req: ExtendedRequest, res: Response) => {
  try {
    const member = req.member;

    const result = await reviewService.getMyReviews(member);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR getMyReviews:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// product reviews (public)
reviewController.getProductReviews = async (req: Request, res: Response) => {
  try {
    const params = req.params as { productId: string };
    const result = await reviewService.getProductReviews(params, req.query);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR getProductReviews:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// top reviews (homepage)
reviewController.getTopReviews = async (req: Request, res: Response) => {
  try {
    const result = await reviewService.getTopReviews(req.query);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR getTopReviews:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

/* ==================================================
   🟣 ADMIN (EJS)
   return { state, data }
================================================== */

// list reviews for admin table
reviewController.listReviews = async (req: AdminRequest, res: Response) => {
  try {
    const result = await reviewService.listReviews();

    return res.render("reviews", {
      reviews: result,
    });
  } catch (err) {
    console.log("ERROR listReviews:", err);
    return res.redirect("/admin");
  }
};

// admin reply / hide / request update
reviewController.replyToReview = async (req: any, res: Response) => {
  try {
    const admin = req.restaurant || req.member; // important
    const input = req.body;

    const result = await reviewService.adminAction(admin, input);

    // ✅ REST response
    return res.status(200).json({
      state: "success",
      data: result,
    });
  } catch (err: any) {
    console.log("ERROR replyToReview:", err);

    // ✅ REST error response
    return res.status(err?.code || 400).json({
      state: "fail",
      message: err?.message || "Failed admin action",
    });
  }
};
reviewController.getReviewMessages = async (req: any, res: Response) => {
  try {
    const member = req.member;
    const { reviewId } = req.params;

    const result = await reviewService.getReviewMessages(member, reviewId);

    return res.status(HttpCode.OK).json(result);
  } catch (err: any) {
    console.log("ERROR getReviewMessages:", err);
    if (err instanceof Errors) return res.status(err.code).json(err);
    return res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ! ADMIN
reviewController.getReviewMessages = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    const member = req.member;
    const { reviewId } = req.params;

    const result = await reviewService.getReviewMessages(member, reviewId);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR getReviewMessages:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default reviewController;
