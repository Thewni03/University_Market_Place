import { create } from "zustand";
import { axiosInstance, BASE_URL } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const normalizeUser = (user) => {
  if (!user) return null;

  return {
    ...user,
    fullName: user.fullName ?? user.fullname ?? "",
  };
};

const getStoredUser = () => {
  try {
    const rawUser = localStorage.getItem("user");
    return normalizeUser(rawUser ? JSON.parse(rawUser) : null);
  } catch {
    return null;
  }
};

const normalizeId = (value) => (value ? value.toString() : "");

export const useAuthStore = create((set,get) => ({
  authUser: getStoredUser(),
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: false,
  onlineusers:[],
  Socket:null,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: normalizeUser(response.data) });
      get().connectSocket();
    } catch (error) {
      if (error.response) {
        console.error("Error checking auth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const payload = {
        email: data.email,
        password: data.password,
        fullname: data.fullName,
      };

      const response = await axiosInstance.post("/auth/signup", payload);
      set({ authUser: normalizeUser(response.data) });
      toast.success("Signup successful!");
      get().connectSocket();
    } catch (error) {
      if (!error.response) {
        toast.error("Cannot reach the server at http://localhost:5001");
      } else {
        toast.error(error.response?.data?.message || "Error signing up");
      }
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ authUser: normalizeUser(response.data) });
      toast.success("Logged in successfully!");
      get().connectSocket();
    } catch (error) {
      if (!error.response) {
        toast.error("Cannot reach the server at http://localhost:5001");
      } else {
        toast.error(error.response?.data?.message || "Error logging in");
      }
    } finally {
      set({ isLoggingIn: false });
    }
  },
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      toast.success("Logged out successfully!");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: normalizeUser(res.data) });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().Socket?.connected) return;

    const socket = io(BASE_URL, {
      withCredentials: true,
      auth: {
        token: localStorage.getItem("token"),
      },
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    socket.emit("join", authUser._id);
    set({ Socket: socket });
    socket.on("online-users", (users) => {
      set({
        onlineusers: Array.isArray(users)
          ? [...new Set(users.map((userId) => normalizeId(userId)).filter(Boolean))]
          : [],
      });
    });

  },
  disconnectSocket: () => {
    if (get().Socket?.connected) get().Socket.disconnect();
    set({ Socket: null });
  }
}));
