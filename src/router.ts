import express from "express";
import makeUploader from "./libs/utils/uploader";
import memberController from "./controllers/member.controller";
import reservationController from "./controllers/reservation.controller";
import restaurantController from "./controllers/restaurant.controller";

const router = express.Router();

router.post(
  "/member/signup",
  memberController.signUp,
);

router.post(
  "/member/create/reservation",
  memberController.verifyAuth,
  reservationController.createReservation
);

export default router;
