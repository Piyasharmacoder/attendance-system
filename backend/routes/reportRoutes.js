import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import {
  getReport,
  exportExcel,
  exportPDF
} from '../controllers/reportController.js';

const router = express.Router();

// 🔹 Reports
router.get('/', protect, authorize('employee','manager','admin'), getReport);

// 🔹 Export Excel
router.get('/excel', protect, authorize('employee','manager','admin'), exportExcel);

// 🔹 Export PDF
router.get('/pdf', protect, authorize('employee','manager','admin'), exportPDF);

export default router;