import mongoose, { Schema } from "mongoose";
import { ReservationStatus } from "../libs/enum/reservation.enum";


const reservationSchema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required:true,
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
    note:{
      type:String,
    },
    email: {
      type: String,
      required: true,
    }
  },
  { timestamps: true}
);

export default mongoose.model('reservation',reservationSchema)
