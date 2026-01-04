import ReservationModel from "../schema/Reservation.model";
import { shapeIntoMongooseObjectId } from "../libs/config";
import { MemberType } from "../libs/enum/member.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import {
  LoginInput,
  Member,
  MemberInput,
  memberUpdateInput,
} from "../libs/types/member";
import * as bcrypt from "bcryptjs";
import { Reservation, ReservationInput } from "../libs/types/reservation";
import { ReservationStatus } from "../libs/enum/reservation.enum";

class ReservationService {
  private readonly reservationModel;
  constructor() {
    this.reservationModel = ReservationModel;
  }

  public async createReservation(
    member: Member,
    input: ReservationInput
  ): Promise<Reservation> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const d = new Date(input.dateTime);
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const already = await ReservationModel.findOne({
      memberId,
      dateTime: { $gte: start, $lte: end },
      reservationStatus: { $ne: ReservationStatus.CANCELED }, // optional
    }).lean();

    if (already) {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CAN_RESERVE_ONE_IN_DAY);
    }

    try {
      const newReservation = await ReservationModel.create({
        memberId,
        dateTime: input.dateTime,
        peopleCount: input.peopleCount,
        note: input.note,
        email: input.email,
      });

      return newReservation as Reservation;
    } catch (err) {
      console.log("Error Model:createReservation", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }
}

export default ReservationService;
