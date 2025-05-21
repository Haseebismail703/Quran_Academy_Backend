import mongoose from 'mongoose';

const voucherSchema = new mongoose.Schema({
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Packages',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courses',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  recipeUrl: {
    type: String,
    default: ''
  },
  publicId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  feePaidDate: {
    type: Date,
  },
  fee: {
    type: Number,
    default: 0
  },
  pendingMonth: {
    type: String, 
  },
  monthEnd: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Voucher = mongoose.model('Voucher', voucherSchema);

export default Voucher;
