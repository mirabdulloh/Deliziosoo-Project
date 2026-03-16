import OrderItemModel from "../schema/OrderItem.model";
import OrderModel from "../schema/Order.model";
import { Member } from "../libs/types/member";
import {
  OrderInquiry,
  OrderItem,
  OrderItemInput,
  OrderStatsResponse,
  OrderUpdateInput,
} from "../libs/types/order";
import { Order } from "../libs/types/order";
import { shapeIntoMongooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enum/order.enum";
import MemberService from "./Member.service";
import AppSettingService from "./AppSetting.service";
import { T } from "../libs/types/common";

class OrderService {
  public readonly orderModel;
  public readonly orderItemModel;
  public memberService;
  public appSettingService;
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
    this.appSettingService = new AppSettingService();
  }
  //! ORders SSR ADMIN

  public async getAdminOrderStats(): Promise<OrderStatsResponse> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const monthStart = new Date(start);
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(end);

    const agg = await this.orderModel
      .aggregate([
        {
          $lookup: {
            from: "orderItems", // ✅ must match Mongo collection name
            localField: "_id",
            foreignField: "orderId",
            as: "items",
          },
        },
        {
          $lookup: {
            from: "members", // ✅ to show USER in table
            localField: "memberId",
            foreignField: "_id",
            as: "member",
          },
        },
        {
          $unwind: { path: "$member", preserveNullAndEmptyArrays: true },
        },

        {
          $facet: {
            // 1) counts by status (all time)
            statusCounts: [
              { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
            ],

            // 2) pending today
            pendingToday: [
              {
                $match: {
                  orderStatus: OrderStatus.PENDING,
                  updatedAt: { $gte: start, $lte: end },
                },
              },
              { $count: "count" },
            ],

            // 3) finished today
            finishedToday: [
              {
                $match: {
                  orderStatus: OrderStatus.FINISH,
                  updatedAt: { $gte: start, $lte: end },
                },
              },
              { $count: "count" },
            ],

            // 4) today total (all except DELETE)
            todayTotal: [
              {
                $match: {
                  orderStatus: { $ne: OrderStatus.DELETE },
                  updatedAt: { $gte: start, $lte: end },
                },
              },
              { $count: "count" },
            ],

            // 5) revenue today (finished only)
            revenueToday: [
              {
                $match: {
                  orderStatus: OrderStatus.FINISH,
                  updatedAt: { $gte: start, $lte: end },
                },
              },
              { $group: { _id: null, total: { $sum: "$orderTotal" } } },
            ],

            // 6) revenue this month (finished only)
            revenueMonth: [
              {
                $match: {
                  orderStatus: OrderStatus.FINISH,
                  updatedAt: { $gte: monthStart, $lte: monthEnd },
                },
              },
              { $group: { _id: null, total: { $sum: "$orderTotal" } } },
            ],

            // 7) top products today
            topProductsToday: [
              {
                $match: {
                  orderStatus: OrderStatus.FINISH,
                  updatedAt: { $gte: start, $lte: end },
                },
              },
              { $unwind: "$items" },
              {
                $group: {
                  _id: "$items.productId",
                  qty: { $sum: "$items.itemQuantity" },
                  revenue: {
                    $sum: {
                      $multiply: ["$items.itemQuantity", "$items.itemPrice"],
                    },
                  },
                },
              },
              { $sort: { qty: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $unwind: { path: "$product", preserveNullAndEmptyArrays: true },
              },
              {
                $project: {
                  productId: { $toString: "$_id" },
                  productName: "$product.productName",
                  qty: 1,
                  revenue: 1,
                },
              },
            ],

            // 8) recent orders list for table (last 15)
            orders: [
              { $sort: { createdAt: -1 } },
              { $limit: 15 },
              {
                $project: {
                  _id: 1,
                  orderTotal: 1,
                  orderStatus: 1,
                  createdAt: 1,
                  memberNick: "$member.memberNick",
                },
              },
            ],
          },
        },
      ])
      .exec();

    const row = agg[0] || {};

    const statusCounts: OrderStatsResponse["statusCounts"] = {
      PENDING: 0,
      PROCESS: 0,
      FINISH: 0,
      DELETE: 0,
    };

    (row.statusCounts || []).forEach((s: { _id: string; count: number }) => {
      if (s && s._id && s._id in statusCounts) {
        statusCounts[s._id as keyof typeof statusCounts] = s.count;
      }
    });

    return {
      statusCounts,
      pendingTodayCount: row.pendingToday?.[0]?.count || 0,
      finishedTodayCount: row.finishedToday?.[0]?.count || 0,
      todayTotalCount: row.todayTotal?.[0]?.count || 0,
      revenueToday: row.revenueToday?.[0]?.total || 0,
      revenueMonth: row.revenueMonth?.[0]?.total || 0,
      topProductsToday: row.topProductsToday || [],
      orders: row.orders || [],
    };
  }

  //! ORders SPA

  public async createOrder(
    member: Member,
    input: OrderItemInput[],
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);

    let delivery = amount < 100 ? 5 : 0;
    let discount = 0;

    // Check if coupon is being used
    const couponCode = input[0]?.couponCode;
    if (couponCode) {
      const validation = await this.memberService.validateCoupon(
        member,
        couponCode,
      );
      if (!validation.valid) {
        throw new Errors(
          HttpCode.BAD_REQUEST,
          validation.message || Message.CREATE_FAILED,
        );
      }
      discount = validation.discount;
    }

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery - discount,
        orderDelivery: delivery,
        memberId: memberId,
      });
      const orderId = newOrder._id;
      console.log("orderId", orderId);
      await this.recordOrderItems(orderId, input);

      // Mark coupon as used AFTER successful order creation
      if (couponCode) {
        await this.memberService.markCouponAsUsed(member, couponCode);
      }

      return newOrder;
    } catch (err) {
      console.log("Error Model:createOrder");
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItems(
    orderId: ObjectId,
    input: OrderItemInput[],
  ): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "INSERTED";
    });

    console.log("promisedList:", promisedList);
    const orderItemState = await Promise.all(promisedList);
    console.log("orderItemState:", orderItemState);
  }

  public async getMyOrders(
    member: Member,
    inquiry: OrderInquiry,
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches: T = { memberId };

    if (inquiry.orderStatus) {
      matches.orderStatus = inquiry.orderStatus;
    }

    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } },
        { $skip: (inquiry.page - 1) * inquiry.limit },
        { $limit: inquiry.limit },
        {
          $lookup: {
            from: "orderItems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItems",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "orderItems.productId",
            foreignField: "_id",
            as: "productData",
          },
        },
        {
          // ✅ Ensure all fields are preserved including financial fields
          $project: {
            _id: 1,
            memberId: 1,
            orderItems: 1,
            productData: 1,
            orderStatus: 1,
            orderTotal: 1,
            orderDelivery: 1,
            deliveryFee: 1,
            couponDiscount: 1,
            totalAmount: 1,
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .exec();
    
    // 🔥 Debug logging
    if (result && result.length > 0) {
      console.log("✅ getMyOrders result:", {
        orderCount: result.length,
        firstOrder: {
          id: result[0]._id,
          orderItems: result[0].orderItems?.length || 0,
          productData: result[0].productData?.length || 0,
          productImages: result[0].productData?.[0]?.productImages ? "✓" : "✗",
        }
      });
    }
    
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateOrder(
    member: Member,
    input: OrderUpdateInput,
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(input.orderId),
      orderStatus = input.orderStatus;
    const currentOrder = await this.orderModel
      .findOne({ memberId: memberId, _id: orderId })
      .exec();
    if (!currentOrder) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    const wasFinished = currentOrder.orderStatus === OrderStatus.FINISH;
    
    // Build update object with financial fields when moving to PROCESS (payment)
    const updateData: any = { orderStatus: orderStatus };
    if (orderStatus === OrderStatus.PROCESS) {
      if (input.deliveryFee !== undefined) updateData.deliveryFee = input.deliveryFee;
      if (input.couponDiscount !== undefined) updateData.couponDiscount = input.couponDiscount;
      if (input.totalAmount !== undefined) updateData.totalAmount = input.totalAmount;
    }
    
    const result = await this.orderModel
      .findOneAndUpdate(
        {
          memberId: memberId,
          _id: orderId,
        },
        updateData,
        { new: true },
      )
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if (
      input.couponCode &&
      (orderStatus === OrderStatus.PROCESS ||
        orderStatus === OrderStatus.FINISH)
    ) {
      const validation = await this.memberService.validateCoupon(
        member,
        input.couponCode,
      );
      if (validation.valid) {
        await this.memberService.markCouponAsUsed(member, input.couponCode);
      }
    }

    // Check if order is finished and award loyalty coupon
    if (orderStatus === OrderStatus.FINISH && !wasFinished) {
      // Get current count of finished orders
      const finishedOrdersCount = await this.getFinishedOrdersCount(memberId);
      const loyaltyRewardCouponEnabled =
        await this.appSettingService.isLoyaltyRewardCouponEnabled();

      // Award one loyalty point only after a successful finished order.
      await this.memberService.addUserPoint(member, 1);

      // Keep totalOrders aligned with actual finished orders count.
      await this.memberService.syncTotalOrders(member, finishedOrdersCount);

      // Give loyalty coupon every 5 finished orders
      // finishedOrdersCount includes the current order that just moved to FINISH
      // So we check if it's divisible by 5 (5, 10, 15, etc.)
      if (loyaltyRewardCouponEnabled && finishedOrdersCount % 5 === 0) {
        await this.memberService.generateLoyaltyCoupon(member);
      }
    }

    return result;
  }

  private async getFinishedOrdersCount(memberId: ObjectId): Promise<number> {
    return await this.orderModel
      .countDocuments({
        memberId: memberId,
        orderStatus: OrderStatus.FINISH,
      })
      .exec();
  }
}

export default OrderService;
