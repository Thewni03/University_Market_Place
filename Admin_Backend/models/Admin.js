const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, select: false },
  fullname:      { type: String, required: true },
  role:          { type: String, enum: ['admin', 'super_admin'], default: 'admin' },
  isActive:      { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil:     { type: Date, default: null },
  lastLogin:     { type: Date, default: null },
  createdBy:     { type: String, default: null },
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

const getAdminModel = () => {
  return mongoose.models.Admin || mongoose.model('Admin', adminSchema);
};

module.exports = { getAdminModel };
