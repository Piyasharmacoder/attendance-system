// models/Attendance.js
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  date: { type: Date, required: true },

  punchIn: {
    time: Date,
    location: { lat: Number, lng: Number },
    selfie: String,
    geoStatus: { type: String, enum: ['IN_RANGE', 'OUT_OF_RANGE'] }
  },

  punchOut: {
    time: Date,
    location: { lat: Number, lng: Number },
    selfie: String,
    geoStatus: { type: String, enum: ['IN_RANGE', 'OUT_OF_RANGE'] }
  },

  workingHours: Number,

  status: {
    type: String,
    enum: ['Completed', 'Incomplete'],
    default: 'Incomplete'
  },

  overtimeHours: { type: Number, default: 0 },
  overtimeApproved: { type: Boolean, default: false }

}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);