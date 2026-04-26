import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './utils/logger.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import overtimeRoutes from './routes/overtimeRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';

const app = express();

// 🔐 Security
app.use(helmet());

// 🌍 CORS
app.use(cors());

// 📦 Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 📊 Logging
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

// 🔗 Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/leaves', leaveRoutes);

// 🧪 Test route
app.get('/', (req, res) => {
  res.send("API Running 🚀");
});

// ❌ Global Error Handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error'
  });
});

export default app;