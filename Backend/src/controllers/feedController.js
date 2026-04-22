import FeedPost from "../models/FeedPost.js";
import Profile from "../models/profile.js";

// Utility to populate author profiles
const populateProfiles = async (posts) => {
  if (!posts || posts.length === 0) return posts;

  const authorIds = [];
  posts.forEach(p => {
    if (p.authorId) authorIds.push(String(p.authorId._id || p.authorId));
    if (p.replies) {
      p.replies.forEach(r => authorIds.push(String(r.authorId._id || r.authorId)));
    }
  });

  const uniqueIds = [...new Set(authorIds.filter(Boolean))];

  const authorProfiles = uniqueIds.length > 0
    ? await Profile.find({ user_id: { $in: uniqueIds } }).select("user_id profile_picture").lean()
    : [];

  const profileMap = new Map(
    authorProfiles.map((p) => [String(p.user_id), p.profile_picture || null])
  );

  return posts.map((post) => {
    const updatedPost = {
      ...post,
      authorPicture: profileMap.get(String(post.authorId?._id || post.authorId)) || null,
    };
    if (updatedPost.replies) {
      updatedPost.replies = updatedPost.replies.map(r => ({
        ...r,
        authorPicture: profileMap.get(String(r.authorId?._id || r.authorId)) || null
      }));
    }
    return updatedPost;
  });
};

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await FeedPost.find()
      .populate({
        path: "authorId",
        select: "fullname username name",
      })
      .populate({
        path: "replies.authorId",
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
    await FeedPost.populate(posts, {
      path: "replies.authorId",
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

export const updateFeedPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) return res.status(400).json({ success: false, message: "Content is required" });

    const post = await FeedPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (String(post.authorId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "You can only edit your own posts" });
    }

    post.content = content.trim();
    await post.save();

    const io = req.app.get("io");
    if (io) io.emit("feed-post-updated", { postId: post._id, content: post.content });

    return res.status(200).json({ success: true, message: "Post updated", data: post });
  } catch (error) {
    console.error("Error updating feed post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const replyToFeedPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const authorId = req.userId;

    if (!content || !content.trim()) return res.status(400).json({ success: false, message: "Content is required" });

    const post = await FeedPost.findById(id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.replies.push({ authorId, content: content.trim() });
    await post.save();

    // Populate the newly added reply to send to frontend
    await post.populate("replies.authorId", "fullname username name");
    
    // Manual mapping using populateProfiles for the authorPicture
    const [postWithProfile] = await populateProfiles([post.toObject()]);
    
    // Get the newly pushed reply (last one)
    const newReply = postWithProfile.replies[postWithProfile.replies.length - 1];

    const io = req.app.get("io");
    if (io) io.emit("feed-post-replied", { postId: post._id, reply: newReply });

    return res.status(201).json({ success: true, data: newReply });
  } catch (error) {
    console.error("Error replying to feed post:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
