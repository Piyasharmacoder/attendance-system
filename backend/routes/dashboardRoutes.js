import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import {
  getMyDashboard,
  getTeamAttendance,
  getAdminDashboard
} from '../controllers/dashboardController.js';

const router = express.Router();

// Employee Dashboard
router.get('/employee', protect, authorize('employee'), getMyDashboard);

// Manager Dashboard
router.get('/manager', protect, authorize('manager', 'admin'), getTeamAttendance);

// Admin Dashboard
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

export default router;