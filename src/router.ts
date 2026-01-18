import express from "express";
import makeUploader from "./libs/utils/uploader";
import memberController from "./controllers/member.controller";
import reservationController from "./controllers/reservation.controller";
import restaurantController from "./controllers/restaurant.controller";
import orderController from "./controllers/order.controller";

const router = express.Router();

router.post(
  "/member/signup",
  memberController.signUp,
);

router.post("/member/login", memberController.login);

router.post(
  "/member/create/reservation",
  memberController.verifyAuth,
  reservationController.createReservation
);


//! ORders SPA


router.post(
  "/order/create",
  memberController.verifyAuth,
  orderController.createOrder
);

export default router;
