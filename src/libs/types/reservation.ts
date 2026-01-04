import { Types } from "mongoose";
import { Request } from "express";
import session, { Session } from "express-session";
import { ReservationStatus } from "../enum/reservation.enum";

export interface ReservationInput {
  dateTime: Date;
  peopleCount: number;
  email: string;
  note?: string;
}

export interface Reservation {
  _id: Types.ObjectId;
  memberId: Types.ObjectId;
  dateTime: Date;
  peopleCount: number;
  reservationStatus: ReservationStatus;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationUpdateInput {
    _id: Types.ObjectId;
    reservationStatus: ReservationStatus;
    cancelReason?: string;
    cancelledAt?: Date;
  }
  
