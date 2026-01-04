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
import { Reservation, ReservationInput, ReservationUpdateInput } from "../libs/types/reservation";
import { ReservationStatus } from "../libs/enum/reservation.enum";
import MailService from "./Mail.service";

class ReservationService {
  private readonly reservationModel;
  private readonly mailService;
  constructor() {
    this.reservationModel = ReservationModel;
    this.mailService = MailService;
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

  public async getAllReservations(){
    const result = await ReservationModel.find().sort({ createdAt: -1 }).lean();

    if (result.length === 0) {
      throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    }

    return result;
  }

  public async updateReservation(input: ReservationUpdateInput): Promise<Reservation> {
    input._id = shapeIntoMongooseObjectId(input._id);
  
    // if admin cancels, set extra fields
    if (input.reservationStatus === ReservationStatus.CANCELED) {
      input.cancelledAt = new Date();
    } else {
      input.cancelReason = undefined;
      input.cancelledAt = undefined;
    }
  
    const result = await ReservationModel
      .findByIdAndUpdate({ _id: input._id }, input, { new: true })
      .exec();
  
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
  
    // ✅ send email after update if canceled
    if (result.reservationStatus === ReservationStatus.CANCELED) {
      await this.mailService.sendReservationCancelledEmail({
        to: result.email,
        dateTime: result.dateTime,
        peopleCount: result.peopleCount,
        reason: input.cancelReason,
      });
    }

    if (result.reservationStatus === ReservationStatus.CONFIRMED) {
        await this.mailService.sendReservationConfirmedEmail({
          to: result.email,
          dateTime: result.dateTime,
          peopleCount: result.peopleCount,
          reason: input.cancelReason,
        });
      }
  
    return result.toObject() as Reservation;
  }
  
  
}

export default ReservationService;
