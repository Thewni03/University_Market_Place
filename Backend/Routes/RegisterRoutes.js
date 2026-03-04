const express = require("express");
const router = express.Router();
const User = require("../Model/RegisterModel");
const RegisterController = require("../Controller/RegisterController");
const { model } = require("mongoose");


router.get("/",RegisterController.getAllUsers);
router.post("/",RegisterController.addUsers);
router.get("/:email",RegisterController.getByEmail);
router.put("/:email",RegisterController.updateUser);
router.delete("/:email",RegisterController.deleteUser);
//export
module.exports = router;

