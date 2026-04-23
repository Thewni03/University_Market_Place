import express from "express";
import { 
  getFeedPosts, 
  createFeedPost, 
  toggleFeedPostUpvote, 
  toggleFeedPostFlag, 
  getTrendingFeedPosts,
  deleteFeedPost,
  updateFeedPost,
  replyToFeedPost
} from "../controllers/feedController.js";
import { protectRoute } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/", getFeedPosts);
router.get("/trending", getTrendingFeedPosts);
router.post("/", protectRoute, createFeedPost);
router.post("/:id/upvote", protectRoute, toggleFeedPostUpvote);
router.post("/:id/flag", protectRoute, toggleFeedPostFlag);
router.delete("/:id", protectRoute, deleteFeedPost);
router.put("/:id", protectRoute, updateFeedPost);
router.post("/:id/reply", protectRoute, replyToFeedPost);

export default router;
