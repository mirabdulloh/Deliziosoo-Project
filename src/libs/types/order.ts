import { ObjectId } from "mongoose";

import { Product } from "./product";
import { OrderStatus } from "../enum/order.enum";

export interface OrderItem {
  _id: ObjectId;
  itemQuantity: number;
  itemPrice: number;
  orderId: ObjectId;
  productId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: ObjectId;
  orderTotal: number;
  orderDelivery: number;
  deliveryFee?: number;
  couponDiscount?: number;
  totalAmount?: number;
  orderStatus: OrderStatus;
  memberId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  /** from aggregations **/
  orderItems: OrderItem[];
  productData: Product[];
}

export interface OrderItemInput {
  itemQuantity: number;
  itemPrice?: number;
  productId: ObjectId;
  orderId?: ObjectId;
  couponCode?: string;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus: OrderStatus;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
  couponCode?: string;
  deliveryFee?: number;
  couponDiscount?: number;
  totalAmount?: number;
  orderItems?: OrderItemInput[];
}

export interface OrderStatsResponse {
  statusCounts: {
    PENDING: number;
    PROCESS: number;
    FINISH: number;
    DELETE: number;
  };
  pendingTodayCount: number;
  finishedTodayCount: number;
  todayTotalCount: number;
  revenueToday: number;
  revenueMonth: number;
  topProductsToday: any[];
  orders: any[];
}
