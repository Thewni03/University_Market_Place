import express from "express";
import { protectRoute } from "../middleware/userAuth.js";
import {
  getUsersforSlider,
  getMessage,
  sentMessage,
} from "../controllers/meaasge.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersforSlider);
router.get("/:id", protectRoute, getMessage);
router.post("/sent/:id", protectRoute, sentMessage);

export default router;
