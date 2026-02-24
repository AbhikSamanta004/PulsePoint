import express from "express";
import { checkSymptoms, getHistory } from "../controllers/aiController.js";
import authUser from "../middlewares/authUser.js";

const aiRouter = express.Router();

aiRouter.post("/check-symptoms", authUser, checkSymptoms);
aiRouter.get("/history", authUser, getHistory);

export default aiRouter;
