import mongoose from 'mongoose';

const overtimeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  date: {
    type: Date,
    required: true
  },

  requestedHours: {
    type: Number,
    required: true,
    min: 1
  },

  reason: {
    type: String,
    required: true
  },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'], // ✅ fixed
    default: 'Pending'
  },

  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }

}, { timestamps: true });

export default mongoose.model('Overtime', overtimeSchema);