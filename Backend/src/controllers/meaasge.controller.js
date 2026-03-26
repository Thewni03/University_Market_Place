import User from "../models/RegisterModel.js";
import Profile from "../models/profile.js";
import Message from "../models/message.model.js";
import cloudinary from "../Utils/cloudinary.js";
import { getReceiverSocketId } from "../Utils/socket.js";
import { getIo } from "../config/io.js";
import { notify } from "../notifications/notification.service.js";

const getAuthenticatedUserId = (req) => req.user?._id || req.userId;

export const getUsersforSlider = async (req, res) => {
  try {
    const loginUserId = getAuthenticatedUserId(req);
    const normalizedLoginUserId = loginUserId?.toString();

    if (!loginUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filteredUsers = await User.find({ _id: { $ne: loginUserId } }).select(
      "-password"
    ).lean();

    const userIds = filteredUsers.map((user) => user._id);
    const profiles = await Profile.find({ user_id: { $in: userIds } })
      .select("user_id profile_picture")
      .lean();

    const profilePictureByUserId = new Map(
      profiles.map((profile) => [profile.user_id.toString(), profile.profile_picture || ""])
    );

    const recentMessages = await Message.find({
      $or: [{ senderId: loginUserId }, { receiverId: loginUserId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: loginUserId,
          isRead: false,
        },
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadCountByUserId = new Map(
      unreadCounts.map((item) => [item._id.toString(), item.count])
    );

    const conversationMetaByUserId = new Map();

    for (const message of recentMessages) {
      const senderId = message.senderId?.toString();
      const receiverId = message.receiverId?.toString();
      const otherUserId =
        senderId === normalizedLoginUserId ? receiverId : senderId;

      if (!otherUserId || conversationMetaByUserId.has(otherUserId)) continue;

      conversationMetaByUserId.set(otherUserId, {
        lastMessage: message.text || (message.image ? "Photo" : ""),
        lastMessageAt: message.createdAt || null,
      });
    }

    const usersWithProfilePictures = filteredUsers.map((user) => ({
      ...user,
      profilePic: user.profilePic || profilePictureByUserId.get(user._id.toString()) || "",
      profile_picture: profilePictureByUserId.get(user._id.toString()) || user.profilePic || "",
      lastMessage: conversationMetaByUserId.get(user._id.toString())?.lastMessage || "",
      lastMessageAt: conversationMetaByUserId.get(user._id.toString())?.lastMessageAt || null,
      unreadCount: unreadCountByUserId.get(user._id.toString()) || 0,
    }));

    usersWithProfilePictures.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });

    return res.status(200).json(usersWithProfilePictures);
  } catch (error) {
    console.error("Error in getUsersforSlider controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessage = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = getAuthenticatedUserId(req);

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Message.updateMany(
      {
        senderId: userToChatId,
        receiverId: myId,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessage controller:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sentMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = getAuthenticatedUserId(req);

    if (!senderId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();

    const sender = await User.findById(senderId).select("fullname").lean();
    const senderName = sender?.fullname || "Someone";
    const notificationTitle = imageUrl
      ? `${senderName} sent you a photo`
      : `${senderName} sent you a message`;
    const notificationBody = imageUrl
      ? "Open Talk Space to view the photo."
      : text?.trim() || "Open Talk Space to read the message.";

    await notify({
      userId: receiverId,
      type: "message",
      title: notificationTitle,
      body: notificationBody,
      channels: ["in-app"],
      metadata: {
        senderId: senderId.toString(),
        senderName,
        receiverId: receiverId.toString(),
        messageId: newMessage._id.toString(),
        kind: imageUrl ? "photo" : "text",
        route: "/dashboard",
      },
    });

    const receiverSocketID = getReceiverSocketId(receiverId);
    const io = getIo();
    if (receiverSocketID) {
      io.to(receiverSocketID).emit("new-message", newMessage);
    }

    // TODO: realtime functionality goes here => socket.io
    return res.status(201).json(newMessage);
  } catch (error) {
    console.log("error in sending message", error.message);
    return res.status(500).json({ message: "internal server error" });
  }
};
