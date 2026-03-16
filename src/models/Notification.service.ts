import NotificationModel from "../schema/Notification.model";
import { Types } from "mongoose";
import Errors, { HttpCode, Message } from "../libs/Errors";

class NotificationService {
  public async createNotification(data: {
    memberId: Types.ObjectId;
    type: "admin-reply" | "low-rating" | "update-requested" | "order-status";
    message: string;
    reviewId?: Types.ObjectId | null;
    orderId?: Types.ObjectId | null;
  }): Promise<any> {
    try {
      const notification = await NotificationModel.create({
        memberId: data.memberId,
        type: data.type,
        message: data.message,
        reviewId: data.reviewId || null,
        orderId: data.orderId || null,
        read: false,
      });

      return notification;
    } catch (err) {
      console.error("Error creating notification:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
    }
  }

  public async getUnreadNotifications(memberId: Types.ObjectId): Promise<any[]> {
    try {
      const notifications = await NotificationModel.find({
        memberId: memberId,
        read: false,
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
        .exec();

      return notifications;
    } catch (err) {
      console.error("Error fetching unread notifications:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }
  }

  public async getAllNotifications(
    memberId: Types.ObjectId,
    limit: number = 50,
    skip: number = 0
  ): Promise<any[]> {
    try {
      const notifications = await NotificationModel.find({
        memberId: memberId,
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean()
        .exec();

      return notifications;
    } catch (err) {
      console.error("Error fetching notifications:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }
  }

  public async markAsRead(notificationId: string): Promise<any> {
    try {
      const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        {
          read: true,
          readAt: new Date(),
        },
        { new: true }
      ).exec();

      if (!notification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      return notification;
    } catch (err) {
      console.error("Error marking notification as read:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }
  }

  public async markAllAsRead(memberId: Types.ObjectId): Promise<any> {
    try {
      const result = await NotificationModel.updateMany(
        { memberId: memberId, read: false },
        {
          read: true,
          readAt: new Date(),
        }
      ).exec();

      return result;
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }
  }

  public async deleteNotification(notificationId: string): Promise<any> {
    try {
      const notification = await NotificationModel.findByIdAndUpdate(
        notificationId,
        {
          deletedAt: new Date(),
        },
        { new: true }
      ).exec();

      if (!notification) {
        throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      }

      return notification;
    } catch (err) {
      console.error("Error deleting notification:", err);
      throw new Errors(
        HttpCode.INTERNAL_SERVER_ERROR,
        Message.SOMETHING_WENT_WRONG
      );
    }
  }
}

export default NotificationService;
