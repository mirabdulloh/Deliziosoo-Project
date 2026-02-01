import { Request, Response } from "express";
import NotificationService from "../models/Notification.service";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ExtendedRequest } from "../libs/types/member";

interface NotificationController {
  getUnreadNotifications?: any;
  getAllNotifications?: any;
  markAsRead?: any;
  markAllAsRead?: any;
  deleteNotification?: any;
}

const notificationController: NotificationController = {};

const notificationService = new NotificationService();

notificationController.getUnreadNotifications = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    if (!req.member) {
      return res
        .status(HttpCode.UNAUTHORIZED)
        .json(new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED));
    }

    const notifications =
      await notificationService.getUnreadNotifications(req.member._id);
    res.status(HttpCode.OK).json(notifications);
  } catch (err) {
    console.log("ERROR, getUnreadNotifications:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

notificationController.getAllNotifications = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    if (!req.member) {
      return res
        .status(HttpCode.UNAUTHORIZED)
        .json(new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED));
    }

    const { limit = 50, skip = 0 } = req.query;
    const notifications = await notificationService.getAllNotifications(
      req.member._id,
      Number(limit),
      Number(skip)
    );

    res.status(HttpCode.OK).json(notifications);
  } catch (err) {
    console.log("ERROR, getAllNotifications:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

notificationController.markAsRead = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    if (!req.member) {
      return res
        .status(HttpCode.UNAUTHORIZED)
        .json(new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED));
    }

    const { notificationId } = req.params;
    const notification =
      await notificationService.markAsRead(notificationId);

    res.status(HttpCode.OK).json(notification);
  } catch (err) {
    console.log("ERROR, markAsRead:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

notificationController.markAllAsRead = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    if (!req.member) {
      return res
        .status(HttpCode.UNAUTHORIZED)
        .json(new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED));
    }

    const result = await notificationService.markAllAsRead(req.member._id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("ERROR, markAllAsRead:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

notificationController.deleteNotification = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    if (!req.member) {
      return res
        .status(HttpCode.UNAUTHORIZED)
        .json(new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED));
    }

    const { notificationId } = req.params;
    const notification =
      await notificationService.deleteNotification(notificationId);

    res.status(HttpCode.OK).json(notification);
  } catch (err) {
    console.log("ERROR, deleteNotification:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default notificationController;
