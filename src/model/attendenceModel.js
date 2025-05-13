import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  date: { type: Date, required: true },
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'absent' }
    }
  ]
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);