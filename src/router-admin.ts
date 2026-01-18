import express from "express";
import restaurantController from "./controllers/restaurant.controller";

import makeUploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
const routerAdmin = express.Router();

/** For Restaurant Login SignUp, Logout */
routerAdmin.get("/", restaurantController.goHome);

routerAdmin
  .get("/signup", restaurantController.getSignUp)
  .post("/signup", restaurantController.processSignUp);

routerAdmin
  .get("/login", restaurantController.getLogin)
  .post("/login", restaurantController.processLogin);

/ Checking Restaurant is Authenticated */;
routerAdmin.get("/check-me", restaurantController.checkAuthSession);

//! Log out the Restaurant Admin */
routerAdmin.get("/logout", restaurantController.logout);

//! For Admin Controlling Users */

routerAdmin.get(
  "/user/all",
  restaurantController.verifyRestaurant,
  restaurantController.getUsers
);

routerAdmin.post(
  "/user/edit",
  restaurantController.verifyRestaurant,
  restaurantController.updateChosenUser
);

// ! For Admin Controlling Reservation Table Panel

routerAdmin.get(
  "/getAll/reservations",
  restaurantController.verifyRestaurant,
  restaurantController.getAllReservations
);
routerAdmin.post(
  "/reservation/update",
  restaurantController.verifyRestaurant,
  restaurantController.updateReservation
);

// ! For Admin Controlling Products
routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProduct
);

routerAdmin.get(
  "/product/create",
  restaurantController.verifyRestaurant,
  productController.getNewProductPage
);

// ! For Creation Products
routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct
);
// ! For Updating Products
routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct
);

// ! For Admin Controlling Orders


routerAdmin.get(
  "/orders/stats",
  restaurantController.verifyRestaurant,
  orderController.getAdminStatsPage
);

export default routerAdmin;
