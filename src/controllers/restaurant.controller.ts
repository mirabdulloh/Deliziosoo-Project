import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enum/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";

const memberService = new MemberService();

const restaurantController: T = {};

restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome:");
    res.render("home");
  } catch (err) {
    console.log("ERROR, goHome:", err);
    res.redirect("/admin");
  }
};

restaurantController.getSignUp = (req: Request, res: Response) => {
  try {
    console.log("getSignUp:");
    res.render("signup");
  } catch (err) {
    console.log("ERROR, getSignUp:", err);
    res.redirect("/admin");
  }
};

restaurantController.getLogin = (req: Request, res: Response) => {
  try {
    console.log("getLogin:");
    res.render("login");
  } catch (err) {
    console.log("ERROR, getLogin:", err);
    res.redirect("/admin");
  }
};

restaurantController.processSignUp = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("processSignUp:");
    console.log("req.body:", req.body);

    const file = req.file;
    if (!file)
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    console.log("req.body:", req.body);

    const newMember: MemberInput = req.body;
    newMember.memberImg = file?.path;
    newMember.memberType = MemberType.RESTAURANT;
    const result = await memberService.processSignUp(newMember);
    req.session.member = result;
    req.session.save(function () {
      res.send("product page"); /** Product pagega jonatiwim kerak wu joyda */
    });
  } catch (err) {
    console.log("ERROR, processSignUp:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/signup")</script> `
    );
  }
};

restaurantController.processLogin = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("processLogin:");
    const input: LoginInput = req.body;
    console.log(req.body);

    const result = await memberService.processLogin(input);

    // TODO: SESSION AUTHENTICATION
    req.session.member = result;
    req.session.save(function () {
      //   res.redirect("/admin/product/all");
      res.send(
        "logged in successfully"
      ); /* Product all page ga yonaltirishim kerak after log in da */
    });
  } catch (err) {
    console.log("ERROR, processLogin:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/login")</script> `
    );
  }
};

restaurantController.checkAuthSession = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    console.log("checkAuthSession:");
    if (req.session?.member)
      res.send(
        `<script> alert("Hi,${req.session.member.memberNick}")</script> `
      );
    else res.send(`<script> alert("${Message.NOT_AUTHENTICATED}")</script>`);
  } catch (err) {
    res.send(err);
    console.log("ERROR, checkAuthSession:", err);
  }
};


/* Log Out of Restaurant Admin */
restaurantController.logout = async (req: AdminRequest, res: Response) => {
  try {
    console.log("logout:");
    req.session.destroy(function () {
      res.redirect("/admin");
    });
  } catch (err) {
    res.redirect("/admin");
    console.log("ERROR, logout:", err);
  }
};
restaurantController;

export default restaurantController;
