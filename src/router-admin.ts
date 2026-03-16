import express from "express";
import restaurantController from "./controllers/restaurant.controller";

import makeUploader from "./libs/utils/uploader";
import productController from "./controllers/product.controller";
import orderController from "./controllers/order.controller";
import reviewController from "./controllers/review.controller";
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
  restaurantController.getUsers,
);

routerAdmin.post(
  "/user/edit",
  restaurantController.verifyRestaurant,
  restaurantController.updateChosenUser,
);

// ! For Admin Controlling Reservation Table Panel

routerAdmin.get(
  "/getAll/reservations",
  restaurantController.verifyRestaurant,
  restaurantController.getAllReservations,
);
routerAdmin.post(
  "/reservation/update",
  restaurantController.verifyRestaurant,
  restaurantController.updateReservation,
);

// ! For Admin Controlling Products
routerAdmin.get(
  "/product/all",
  restaurantController.verifyRestaurant,
  productController.getAllProduct,
);

routerAdmin.get(
  "/product/create",
  restaurantController.verifyRestaurant,
  productController.getNewProductPage,
);

// ! For Creation Products
routerAdmin.post(
  "/product/create",
  restaurantController.verifyRestaurant,
  makeUploader("products").array("productImages", 5),
  productController.createNewProduct,
);
// ! For Updating Products
routerAdmin.post(
  "/product/:id",
  restaurantController.verifyRestaurant,
  productController.updateChosenProduct,
);

// ! For Updating Product Promotion
routerAdmin.post(
  "/product/promotion/:id",
  restaurantController.verifyRestaurant,
  productController.updateProductPromotion,
);

routerAdmin.delete(
  "/product/:id/hard-delete",
  restaurantController.verifyRestaurant,
  productController.hardDeleteProduct,
);

// ! For Admin Controlling Orders

routerAdmin.get(
  "/orders/stats",
  restaurantController.verifyRestaurant,
  orderController.getAdminStatsPage,
);

// ! SEttings
routerAdmin.get(
  "/settings",
  restaurantController.verifyRestaurant,
  restaurantController.getAdminSettingsPage,
);

routerAdmin.post(
  "/settings/update",
  restaurantController.verifyRestaurant,
  makeUploader("members").single("memberImage"),
  restaurantController.updateAdminSettings,
);

// ! REviews Panel ADMIN
routerAdmin.get(
  "/reviews",
  restaurantController.verifyRestaurant,
  reviewController.listReviews,
);

routerAdmin.post(
  "/reply/review",
  restaurantController.verifyRestaurant,
  reviewController.replyToReview
);

export default routerAdmin;
