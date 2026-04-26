import express from 'express';

import {
  register,
  login,
  getProfile,
  getUsers,
  getManagers,
  getUserDetailsWithAttendance,
  updateUserById
} from '../controllers/authController.js';

import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔓 Public
router.post('/register', register);
router.post('/login', login);

// 🔐 Protected
router.get('/profile', protect, getProfile);

// 🔒 Role-based
router.get('/users', protect, authorize('admin', 'manager'), getUsers);
router.get('/managers', protect, authorize('admin', 'manager'), getManagers);
router.get('/users/:id/details', protect, authorize('admin', 'manager', 'employee'), getUserDetailsWithAttendance);
router.put('/users/:id', protect, authorize('admin', 'manager'), updateUserById);

export default router;