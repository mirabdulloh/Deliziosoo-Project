import mongoose, { Schema } from "mongoose";
import { ReservationStatus } from "../libs/enum/reservation.enum";

const reservationSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    dateTime: {
      type: Date,
      required: true,
    },
    peopleCount: {
      type: Number,
      min: 1,
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ReservationStatus,
      default: ReservationStatus.PENDING,
    },
    note: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    cancelReason: { type: String },
    cancelledAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("reservation", reservationSchema);
