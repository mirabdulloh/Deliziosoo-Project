import mongoose, { Schema } from "mongoose";
import { ReservationStatus } from "../libs/enum/reservation.enum";


const reservationSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
    },
    dateTime: {
      type: Date,
      required: true,
    },
    peopleCount: {
      type: Number,
      default: 0,
      required: true,
    },
    reservationStatus: {
      type: String,
      enum: ReservationStatus,
      default: ReservationStatus.PENDING,
    },
  },
  { timestamps: true}
);

export default mongoose.model('reservation',reservationSchema)
