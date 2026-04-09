import FeedPost from "../models/FeedPost.js";
import Profile from "../models/profile.js";

// Utility to populate author profiles
const populateProfiles = async (posts) => {
  if (!posts || posts.length === 0) return posts;

  const authorIds = posts
    .map((p) => p.authorId?._id || p.authorId)
    .filter(Boolean)
    .map((id) => String(id));

  const authorProfiles = authorIds.length > 0
    ? await Profile.find({ user_id: { $in: authorIds } }).select("user_id profile_picture").lean()
    : [];

  const profileMap = new Map(
    authorProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
  );

  return posts.map((post) => ({
    ...post,
    authorPicture: profileMap.get(String(post.authorId?._id || post.authorId)) || null,
  }));
};

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await FeedPost.find()
      .populate({
        path: "authorId",
        select: "fullname username name",
      })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const populatedPosts = await populateProfiles(posts);

    return res.status(200).json({
      success: true,
      data: populatedPosts,
    });
  } catch (error) {
    console.error("Error fetching feed posts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const createFeedPost = async (req, res) => {
  try {
    const { content } = req.body;
    const authorId = req.userId; // Provided by authMiddleware

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    if (!authorId) {
       return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const newPost = new FeedPost({
      authorId,
      content: content.trim(),
    });

    await newPost.save();

    // Populate the newly created post so the frontend immediately has author info
    const populatedObj = await FeedPost.findById(newPost._id)
      .populate({
        path: "authorId",
        select: "fullname username name",
      })
      .lean();

    const [postWithProfile] = await populateProfiles([populatedObj]);

    // Broadcast using Socket.IO to instantly update connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("new-feed-post", postWithProfile);
    }

    return res.status(201).json({
      success: true,
      data: postWithProfile,
    });
  } catch (error) {
    console.error("Error creating feed post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleFeedPostUpvote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await FeedPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const index = post.upvotes.indexOf(userId);
    if (index === -1) {
      post.upvotes.push(userId);
      const flagIndex = post.flags.indexOf(userId);
      if (flagIndex > -1) post.flags.splice(flagIndex, 1); // Mutually exclusive
    } else {
      post.upvotes.splice(index, 1);
    }

    await post.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("feed-post-updated", { postId: post._id, upvotes: post.upvotes, flags: post.flags });
    }

    return res.status(200).json({ success: true, data: { upvotes: post.upvotes, flags: post.flags } });
  } catch (error) {
    console.error("Error upvoting post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const toggleFeedPostFlag = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await FeedPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const index = post.flags.indexOf(userId);
    if (index === -1) {
      post.flags.push(userId);
      const upvoteIndex = post.upvotes.indexOf(userId);
      if (upvoteIndex > -1) post.upvotes.splice(upvoteIndex, 1); // Mutually exclusive
    } else {
      post.flags.splice(index, 1);
    }

    await post.save();

    const io = req.app.get("io");
    if (io) {
      io.emit("feed-post-updated", { postId: post._id, upvotes: post.upvotes, flags: post.flags });
    }

    return res.status(200).json({ success: true, data: { upvotes: post.upvotes, flags: post.flags } });
  } catch (error) {
    console.error("Error flagging post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTrendingFeedPosts = async (req, res) => {
  try {
    const posts = await FeedPost.aggregate([
      {
        $addFields: {
          trustScore: {
            $subtract: [
              { $size: { $ifNull: ["$upvotes", []] } },
              { $size: { $ifNull: ["$flags", []] } }
            ]
          }
        }
      },
      { $sort: { trustScore: -1, createdAt: -1 } },
      { $limit: 3 }
    ]);
    
    await FeedPost.populate(posts, {
      path: "authorId",
      select: "fullname username profile_picture",
    });

    return res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error("Error fetching trending feed posts:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const deleteFeedPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const post = await FeedPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    // Explicit Ownership Security Check
    if (String(post.authorId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "You can only delete your own posts" });
    }

    await FeedPost.findByIdAndDelete(id);

    // Blast remote clients so the post disappears visually
    const io = req.app.get("io");
    if (io) {
      io.emit("feed-post-deleted", { postId: id });
    }

    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
