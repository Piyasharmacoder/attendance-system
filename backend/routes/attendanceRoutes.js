import express from 'express';
import {
  punchIn,
  punchOut,
  getAttendanceRecords
} from '../controllers/attendanceController.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
console.log("call puch  in ");


router.post('/punch-in', protect, punchIn);
router.post('/punch-out', protect, punchOut);
router.get(
  '/',
  protect,
  authorize('employee', 'manager', 'admin'),
  getAttendanceRecords
);

export default router;