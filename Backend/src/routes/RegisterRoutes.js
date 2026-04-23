import express from "express";
import RegisterController from "../controllers/RegisterController.js";
import upload from "../uploads/Uploads.js";
import { protect } from "../middleware/userAuth.js"; //ensure path matches your auth middleware
import User from "../models/RegisterModel.js";      // needed for the direct findByIdAndUpdate call

const router = express.Router();

router.post("/login", RegisterController.loginUser);
router.post("/", upload.single("student_id_pic"), RegisterController.addUsers);
router.get("/", RegisterController.getAllUsers);
router.get("/trust-score/:email", RegisterController.getTrustScore);
router.get("/:email", RegisterController.getByEmail);
router.put("/:email", upload.single("student_id_pic"), RegisterController.updateUser);


router.delete("/:email", RegisterController.deleteUser);


router.patch('/settings', protect, async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { notificationSettings: req.body.notificationSettings } },
        { returnDocument: 'after' }
      );
      res.json({ success: true, notificationSettings: user.notificationSettings });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

export default router;
