const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true,
    minlength: 8
  },

  fullname: {
    type: String,
    required: true,
    trim: true
  },

  student_id: {
    type: String,
    required: true,
    unique: true
  },

  student_id_pic: {
    type: String, // store file path or image URL
    required: true
  },

  university_name: {
    type: String,
    required: true
  },

  graduate_year: {
    type: Number, // e.g., 2026
    required: true
  },

  verification_status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'suspended'],
    default: 'pending',
    required: true
  },

  phone: {
    type: String,
    default: null
  },

  reset_token: {
    type: String,
    default: null
  },

  reset_token_expires: {
    type: Date,
    default: null
  },

  created_at: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true }); 
// timestamps automatically adds createdAt and updatedAt

module.exports = mongoose.model("Users",  //file name
    userSchema);//function name