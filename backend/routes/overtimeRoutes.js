import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import {
  requestOT,
  updateOT,
  getAllOT
} from '../controllers/overtimeController.js';

const router = express.Router();

// 🔹 Employee request OT
router.post('/request', protect, authorize('employee'), requestOT);

// 🔹 View OT (ALL ROLES)
router.get('/',
  protect,
  authorize('employee', 'manager', 'admin'),
  getAllOT
);

// 🔹 Approve / Reject OT
router.put('/:id',
  protect,
  authorize('manager', 'admin'),
  updateOT
);

export default router;