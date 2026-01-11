import { ExtendedRequest } from "../libs/types/member";
import { T } from "../libs/types/common";
import Errors, { HttpCode } from "../libs/Errors";
import { Response } from "express";
import OrderService from "../models/Order.service";
import { OrderStatus } from "../libs/enum/order.enum";
import { OrderUpdateInput } from "../libs/types/order";

const orderController: T = {};
const orderService = new OrderService();

orderController.getFinishedToday = async (req, res) => {
    try {
      const finishedTodayCount =
        await orderService.getFinishedToday();
  
      return res.render("orders", {
        finishedTodayCount,
      });
    } catch (err) {
      console.log("ERROR getFinishedToday:", err);
      return res.redirect("/admin");
    }
  };
  


/! SPA */

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

export default orderController;
