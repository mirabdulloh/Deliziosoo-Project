import { NextFunction, Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberService from "../models/Member.service";
import { T } from "../libs/types/common";
import { Member, MemberInput } from "../libs/types/member";

const memberService = new MemberService();

const memberController: T = {};

memberController.signUp = async (req: Request, res: Response) => {
  // service model
  try {
    console.log("signUp:");

    const input: MemberInput = req.body,
      result: Member = await memberService.signUp(input);
    // TODO: Token Authentication

    res.status(HttpCode.CREATED).json({ member: result});
  } catch (err) {
    console.log("ERROR, signUp:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default memberController;
