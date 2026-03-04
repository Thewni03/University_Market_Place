const User = require("../Model/RegisterModel");
const bcrypt = require("bcryptjs");


// get all
const getAllUsers = async (req, res,next) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    return res.status(200).json(users);

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// add users
const addUsers = async (req, res,next) => {

  const {
    email,
    password,
    fullname,
    student_id,
    student_id_pic,
    university_name,
    graduate_year,
    phone
  } = req.body;

  try {

    // check existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      fullname,
      student_id,
      student_id_pic,
      university_name,
      graduate_year,
      phone
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unable to add user" });
  }
};


//get by email
const getByEmail = async (req, res,next) => {
    const email = req.params.email;
  
    try {
      const user = await User.findOne({ email: email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      return res.status(200).json(user);
  
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  //update user
  
  const updateUser = async (req, res) => {
    const userEmail = req.params.email;   
    const {
      password,
      fullname,
      student_id,
      student_id_pic,
      university_name,
      graduate_year,
      phone,
      verification_status // admin only
    } = req.body;
  
    try {
      // Find the user by email
      const user = await User.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // =for users
      if (password) {
        // hash password before saving
        user.password = await bcrypt.hash(password, 10);
      }
      if (fullname) user.fullname = fullname;
      if (student_id) user.student_id = student_id;
      if (student_id_pic) user.student_id_pic = student_id_pic;
      if (university_name) user.university_name = university_name;
      if (graduate_year) user.graduate_year = graduate_year;
      if (phone) user.phone = phone;
  
      // admin can update
      if (verification_status) {
        const allowedStatus = ["pending", "verified", "rejected", "suspended"];
        if (!allowedStatus.includes(verification_status)) {
          return res.status(400).json({ message: "Invalid verification status" });
        }
  
        user.verification_status = verification_status;
      }
  
      // Save changes
      await user.save();
  
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user
      });
  
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  // delete user
  const deleteUser = async (req, res) => {
    const userEmail = req.params.email;
  
    try {
      //Find user by email
      const user = await User.findOne({ email: userEmail });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await user.deleteOne(); // or user.remove() in older versions
  
      return res.status(200).json({
        success: true,
        message: `User ${userEmail} deleted successfully`
      });
  
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
  
module.exports = {
  getAllUsers,
  addUsers,
  getByEmail,
  updateUser ,
  deleteUser
};