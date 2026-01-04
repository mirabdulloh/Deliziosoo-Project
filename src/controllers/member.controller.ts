import { NextFunction, Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberService from "../models/Member.service";
import { T } from "../libs/types/common";
import { ExtendedRequest, Member, MemberInput } from "../libs/types/member";
import AuthService from "../models/Auth.service";
import { AUTH_TIME } from "../libs/config";

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


    res.status(HttpCode.CREATED).json({ member: result});
  } catch (err) {
    console.log("ERROR, signUp:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};



memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("verifyAuth:");
    const token = req.cookies["accessToken"];
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, verifyAuth:", err);
  }
};


export default memberController;
