import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../models/Member.service";
import { AdminRequest, LoginInput, MemberInput } from "../libs/types/member";
import { MemberType } from "../libs/enum/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import ReservationService from "../models/Reservation.service";
import { ReservationStatus } from "../libs/enum/reservation.enum";

const memberService = new MemberService();
const reservationService = new ReservationService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
  try {
    console.log("goHome:");

    if (!res.locals.member) {
      return res.render("login");
    }

    return res.render("home", { member: res.locals.member });
  } catch (err) {
    console.log("ERROR, goHome:", err);
    return res.redirect("/admin");
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
    const newMember: MemberInput = req.body;
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
      res.redirect("/admin");
      /* Product all page ga yonaltirishim kerak after log in da */
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

/\* Log Out of Restaurant Admin */;

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

/\* ! For Admin Controlling Users */;

restaurantController.getUsers = async (req: Request, res: Response) => {
  try {
    console.log("getUsers:");
    const result = await memberService.getUsers();
    res.render("users", { users: result });
  } catch (err) {
    console.log("ERROR, getUsers:", err);
    res.redirect("/admin/login");
  }
};

restaurantController.updateChosenUser = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenUser:");
    const result = await memberService.updateChosenUser(req.body);
    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("ERROR, updateChosenUser:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

// ! For Verifying the Admin */
restaurantController.verifyRestaurant = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.session?.member?.memberType === MemberType.RESTAURANT) {
    req.member = req.session.member;
    next();
  } else {
    const message = Message.NOT_AUTHENTICATED;
    res.send(
      `<script> alert("${message}"); window.location.replace("/admin/login")</script>`
    );
  }
};

// ! For Admin Controlling Reservation Table Panel

restaurantController.getAllReservations = async (
  req: AdminRequest,
  res: Response
) => {
  try {
    const result = await reservationService.getAllReservations();
    return res.render("reservation", { reservations: result });
  } catch (err) {
    console.log("ERROR getReservations:", err);
    return res.redirect("/admin");
  }
};

restaurantController.updateReservation = async (
  req: Request,
  res: Response
) => {
  try {
    await reservationService.updateReservation(req.body);
    return res.redirect("/admin/getAll/reservations");
  } catch (err) {
    console.log("ERROR updateReservation:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    return res.send(
      `<script>alert("${message}"); window.location.replace("/admin/reservation/all")</script>`
    );
  }
};

export default restaurantController;
