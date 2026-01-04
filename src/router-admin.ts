import express from "express"
import restaurantController from "./controllers/restaurant.controller";

import makeUploader from "./libs/utils/uploader";
const routerAdmin = express.Router()


routerAdmin.get("/", restaurantController.goHome)


export default routerAdmin;