import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  fromDate: String,
  toDate: String,

  reason: String,

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }

}, { timestamps: true });

export default mongoose.model('Leave', leaveSchema);