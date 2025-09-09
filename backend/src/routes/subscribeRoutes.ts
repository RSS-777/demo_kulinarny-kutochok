import express from "express";
import { userMiddleware } from "../middlewares/userMiddleware.js";
import { subscribeCreate, subscribeDelete, subscribeCheck } from "../controllers/subscriptionController.js";

const router = express.Router();

router.post("/create", userMiddleware, subscribeCreate);
router.delete("/delete", userMiddleware, subscribeDelete);
router.get("/check", userMiddleware, subscribeCheck);

export default router;