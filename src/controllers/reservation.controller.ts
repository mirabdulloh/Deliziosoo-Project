import { NextFunction, Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberService from "../models/Member.service";
import { T } from "../libs/types/common";
import { Member, MemberInput } from "../libs/types/member";
import ReservationService from "../models/Reservation.service";
import restaurantController from "./restaurant.controller";
import { ReservationInput } from "../libs/types/reservation";

const reservationService = new ReservationService();

const reservationController: T = {};


reservationController.createReservation = async (req: any, res: Response) => {
    try {
      const input: ReservationInput = req.body;
      const member = req.member;
      const result = await reservationService.createReservation(member, input);
      res.status(HttpCode.OK).json(result);
    } catch (err) {
      console.log("ERROR createReservation:", err);
      if (err instanceof Errors) res.status(err.code).json(err);
      else res.status(Errors.standard.code).json(Errors.standard);
      console.log("ERROR, updateOrder:", err);
    }
  };


export default reservationController;