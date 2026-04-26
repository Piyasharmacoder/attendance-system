import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import{authorize} from '../middleware/roleMiddleware.js';
import { applyLeave, updateLeave } from '../controllers/leaveController.js';

const router = express.Router();

// Employee apply leave
router.post('/apply', protect, authorize('employee'), applyLeave);

// Manager + Admin approve/reject
router.put('/:id', protect, authorize('manager', 'admin'), updateLeave);

export default router;