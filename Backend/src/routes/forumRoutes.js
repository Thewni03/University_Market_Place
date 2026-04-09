import express from "express";
import { protectRoute } from "../middleware/userAuth.js";
import {
  getQuestions,
  getQuestionThread,
  createQuestion,
  toggleQuestionUpvote,
  postAnswer,
  toggleAnswerUpvote,
  markAnswerAccepted
} from "../controllers/forumController.js";

const router = express.Router();

router.get("/", getQuestions);
router.get("/:id", getQuestionThread);

router.post("/", protectRoute, createQuestion);
router.post("/:id/upvote", protectRoute, toggleQuestionUpvote);

router.post("/:id/answer", protectRoute, postAnswer);
router.post("/answer/:answerId/upvote", protectRoute, toggleAnswerUpvote);
router.post("/:id/answer/:answerId/accept", protectRoute, markAnswerAccepted);

export default router;
