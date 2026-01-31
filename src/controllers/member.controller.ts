import { NextFunction, Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberService from "../models/Member.service";
import { T } from "../libs/types/common";
import {
  ExtendedRequest,
  LoginInput,
  Member,
  MemberInput,
  memberUpdateInput,
} from "../libs/types/member";
import AuthService from "../models/Auth.service";
import { AUTH_TIME } from "../libs/config";
import MemberModel from "../schema/Member.model";

const memberService = new MemberService();
const authService = new AuthService();

const memberController: T = {};

memberController.signUp = async (req: Request, res: Response) => {
  // service model
  try {
    console.log("signUp:");

    const input: MemberInput = req.body,
      result: Member = await memberService.signUp(input);
    // TODO: Token Authentication
    const token = await authService.createToken(result);
    // browser cookies ichiga joylanishi
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIME * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ member: result });
  } catch (err) {
    console.log("ERROR, signUp:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.login = async (req: Request, res: Response) => {
  // service model
  try {
    console.log("login:");
    const input: LoginInput = req.body,
      result = await memberService.login(input);
    console.log("login result=>", result);
    // token creation
    const token = await authService.createToken(result);
    // browser cookies ichiga joylanishi
    res.cookie("accessToken", token, {
      maxAge: AUTH_TIME * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, login:", err);
  }
};

memberController.logout = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout:");
    res.cookie("accessToken", null, { maxAge: 0, httpOnly: true });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, logout:", err);
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getMemberDetail:");
    const result = await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, getMemberDetail:", err);
  }
};

memberController.validateCoupon = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("validateCoupon:");
    const { couponCode } = req.body;
    const result = await memberService.validateCoupon(req.member, couponCode);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, validateCoupon:", err);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember:");
    const input: memberUpdateInput = req.body;
    if (req.file) input.memberImg = req.file.path.replace(/\\/g, "/");
    const result = await memberService.updateMember(req.member, input);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, updateMember:", err);
  }
};
memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("verifyAuth:");
    const token = req.cookies["accessToken"];

    if (token) req.member = await authService.checkAuth(token);

    // ========== ADD THIS BLOCK HERE ==========
    if (req.member?._id) {
      await MemberModel.updateOne(
        {
          _id: req.member._id,
          $or: [
            { lastActiveAt: null },
            { lastActiveAt: { $lte: new Date(Date.now() - 60_000) } },
          ],
        },
        { $set: { lastActiveAt: new Date() } },
      );
    }
    // ========================================

    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, verifyAuth:", err);
  }
};

memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("retrieveAuth:");
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    next();
  } catch (err) {
    console.log("ERROR, retrieveAuth:", err);
    next();
  }
};

export default memberController;
