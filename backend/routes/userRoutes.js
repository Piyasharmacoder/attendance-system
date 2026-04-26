import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { createUser } from '../controllers/authController.js';

const router = express.Router();

// Only Admin
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.send("Admin Dashboard");
});

// Create user (Admin / Manager)
router.post('/', protect, authorize('admin', 'manager'), createUser);

// Manager + Admin
router.get('/manager', protect, authorize('manager', 'admin'), (req, res) => {
  res.send("Manager Dashboard");
});

// All logged in users
router.get('/profile', protect, (req, res) => {
  res.send("User Profile");
});

export default router;