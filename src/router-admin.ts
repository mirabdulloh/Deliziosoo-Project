import express from "express";
import restaurantController from "./controllers/restaurant.controller";

import makeUploader from "./libs/utils/uploader";
const routerAdmin = express.Router();


/** For Restaurant Login SignUp, Logout */
routerAdmin.get("/", restaurantController.goHome);

routerAdmin
  .get("/signup", restaurantController.getSignUp)
  .post(
    "/signup",
    makeUploader("members").single("memberImage"),
    restaurantController.processSignUp
  );

routerAdmin
  .get("/login", restaurantController.getLogin)
  .post("/login", restaurantController.processLogin);


/** Checking Restaurant is Authenticated */
routerAdmin.get("/check-me", restaurantController.checkAuthSession);

/* Log out the Restaurant Admin */
routerAdmin.get("/logout", restaurantController.logout)



/* For Admin Controlling Users */

routerAdmin.get("/user/all",
    restaurantController.verifyRestaurant, 
    restaurantController.getUsers);

export default routerAdmin;
