import mongoose from "mongoose";

const { Schema } = mongoose;

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

  student_id_pic: { type: String, required: false, default: "" },

  university_name: {
    type: String,
    required: true
  },

  graduate_year: {
    type: Number, 
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
  trust_score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  created_at: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

export default mongoose.model("Users", userSchema);

