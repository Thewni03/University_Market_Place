const express = require("express");
const router = express.Router();
const RegisterController = require("../Controller/RegisterController");
const upload = require('../uploads/Uploads');

router.get("/", RegisterController.getAllUsers);
router.post("/", upload.single('student_id_pic'), RegisterController.addUsers); 
router.get("/:email", RegisterController.getByEmail);
router.put("/:email", upload.single('student_id_pic'), RegisterController.updateUser);
router.delete("/:email", RegisterController.deleteUser);
router.post("/login", RegisterController.loginUser);

module.exports = router;