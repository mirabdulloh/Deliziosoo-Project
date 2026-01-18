import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";
import { Response } from "express";
import OrderService from "../models/Order.service";
import { OrderStatus } from "../libs/enum/order.enum";
import { OrderUpdateInput } from "../libs/types/order";

const orderController: T = {};
const orderService = new OrderService();

/! SSR */;

orderController.getAdminStatsPage = async (
  req: ExtendedRequest,
  res: Response
) => {
  try {
    const stats = await orderService.getAdminOrderStats();

    res.render("orders", stats);
  } catch (err) {
    console.log("ERROR getAdminStatsPage:", err);
    return res.redirect("/admin");
  }
};


/! SPA */;

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("createOrder:");
    const result = await orderService.createOrder(req.member, req.body);
    res.status(HttpCode.CREATED).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, createOrder:", err);
  }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyOrders:");

    const { page, limit, orderStatus } = req.query;
    const inquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus,
    };

    const result = await orderService.getMyOrders(req.member, inquiry);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, getMyOrders:", err);
  }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateOrder:");
    const input: OrderUpdateInput = req.body;
    console.log("input", input);
    const result = await orderService.updateOrder(req.member, input);

    res.status(HttpCode.OK).json(result);
  } catch (err) {
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
    console.log("ERROR, updateOrder:", err);
  }
};

export default orderController;
