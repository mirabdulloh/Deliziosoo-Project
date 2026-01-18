import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enum/order.enum";

const orderSchema = new Schema(
  {
    orderTotal: {
      type: Number,
      required: true,
    },
    orderDelivery: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PENDING,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
    paidAt: { type: Date }, // when moved to PROCESS (payment)
    finishedAt: { type: Date }, // when moved to FINISH
    canceledAt: { type: Date }, // optional if you add cancel
  },

  { timestamps: true }
);
orderSchema.index({ orderStatus: 1, createdAt: 1 });
orderSchema.index({ paidAt: 1 });
orderSchema.index({ finishedAt: 1 });

export default mongoose.model("Order", orderSchema);
