import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// 🔐 PROTECT ROUTE
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;

    next();

  } catch (error) {
    logger.error(`Auth Error: ${error.message}`);
    res.status(401).json({ message: "Invalid token" });
  }
};


// 🔒 ROLE BASED AUTH
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role ${req.user.role} not allowed`
      });
    }
    next();
  };
};