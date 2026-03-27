const jwt = require('jsonwebtoken');
const { getAdminModel } = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const Admin = await getAdminModel();
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    if (!admin.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is not valid.' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

module.exports = { protect, restrictTo };
