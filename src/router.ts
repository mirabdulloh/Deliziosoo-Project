import express from "express";
import makeUploader from "./libs/utils/uploader";
import memberController from "./controllers/member.controller";
const router = express.Router();

router.post("/member/signup", memberController.signUp);

export default router;