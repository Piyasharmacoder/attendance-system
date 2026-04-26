import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// 🔹 REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password) {
  return res.status(400).json({ message: "All fields required" });
}

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const requestedRole = role?.toLowerCase();
    if (requestedRole && requestedRole !== 'employee') {
      return res.status(403).json({
        message: "Only employee signup is allowed"
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      manager: managerId || null
    });

    const { password: _, ...userData } = user._doc;

    res.status(201).json({
      user: userData,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
      if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { password: _, ...userData } = user._doc;

    res.json({
      user: userData,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    logger.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 PROFILE
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};


// 🔹 GET USERS (ADMIN / MANAGER)
export const getUsers = async (req, res) => {
  let query = {};

  if (req.user.role === 'manager') {
    query = { manager: req.user._id };
  }

  const users = await User.find(query).select('-password');

  res.json(users);
};

// 🔹 GET MANAGERS
export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' })
      .select('_id name email role')
      .sort({ name: 1 });

    res.json({ success: true, data: managers });
  } catch (error) {
    logger.error(`Get Managers Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 GET USER DETAILS + ATTENDANCE LOGS
export const getUserDetailsWithAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password').populate('manager', 'name email role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSameUser = req.user._id.toString() === user._id.toString();
    const isManagerOfUser =
      req.user.role === 'manager' &&
      user.manager &&
      user.manager._id.toString() === req.user._id.toString();

    if (!isAdmin && !isSameUser && !isManagerOfUser) {
      return res.status(403).json({ message: 'Not authorized to view this user' });
    }

    const attendance = await Attendance.find({ user: user._id }).sort({ date: -1, createdAt: -1 });

    res.json({
      success: true,
      user,
      attendance
    });
  } catch (error) {
    logger.error(`Get User Details Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 UPDATE USER DETAILS
export const updateUserById = async (req, res) => {
  try {
    
    const { id } = req.params;
    const { name, email, role, managerId } = req.body;
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const isAdmin = req.user.role === 'admin';
    const isManagerOfUser =
    req.user.role === 'manager' &&
    user.manager &&
    user.manager.toString() === req.user._id.toString();
    
    if (!isAdmin && !isManagerOfUser) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }
    
    if (role) {
      const validRoles = ['admin', 'manager', 'employee'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Invalid role provided' });
      }
      
      if (!isAdmin && role !== 'employee') {
        return res.status(403).json({ message: 'Managers can only assign employee role' });
      }
    }
    
    if (!isAdmin && role === 'admin') {
      return res.status(403).json({ message: 'Only admins can assign admin role' });
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;

    if (managerId !== undefined) {
      const managerValue = managerId === '' ? null : managerId;

      if (managerValue && !mongoose.Types.ObjectId.isValid(managerValue)) {
        return res.status(400).json({ message: 'Invalid manager id' });
      }

      if (!isAdmin && managerValue && managerValue !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Managers can only assign themselves as manager' });
      }

      if (managerValue) {
        if (managerValue === id) {
          return res.status(400).json({ message: 'User cannot be their own manager' });
        }

        const managerUser = await User.findById(managerValue).select('_id role');
        if (!managerUser || managerUser.role !== 'manager') {
          return res.status(400).json({ message: 'Selected manager is invalid' });
        }
      }

      updateData.manager = managerValue || null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');
    const userData = updatedUser.toObject();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: userData
    });
  } catch (error) {
    logger.error(`Update User Error: ${error.message}`);
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// 🔹 CREATE USER (ADMIN / MANAGER)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, managerId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const requestedRole = (role || 'employee').toLowerCase();
    const validRoles = ['admin', 'manager', 'employee'];
    if (!validRoles.includes(requestedRole)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    const isAdmin = req.user.role === 'admin';
    if (!isAdmin && requestedRole !== 'employee') {
      return res.status(403).json({ message: 'Managers can only create employees' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let finalManagerId = null;
    if (managerId) {
      if (!mongoose.Types.ObjectId.isValid(managerId)) {
        return res.status(400).json({ message: 'Invalid manager id' });
      }

      const managerUser = await User.findById(managerId).select('_id role');
      if (!managerUser || managerUser.role !== 'manager') {
        return res.status(400).json({ message: 'Selected manager is invalid' });
      }

      if (!isAdmin && managerId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Managers can only assign themselves as manager' });
      }

      finalManagerId = managerId;
    } else if (!isAdmin) {
      finalManagerId = req.user._id;
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: requestedRole,
      manager: finalManagerId
    });

    const userData = await User.findById(user._id).select('-password');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userData
    });
  } catch (error) {
    logger.error(`Create User Error: ${error.message}`);
    if (error?.name === 'ValidationError' || error?.name === 'CastError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};