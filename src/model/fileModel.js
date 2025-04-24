import mongoose from 'mongoose';

const resoursesSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'image'], required: true },
  classId : { type: mongoose.Schema.Types.ObjectId, ref: 'courses', required: true },
  url: { type: String },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },

});

const File = mongoose.model('resouorses', resoursesSchema);
export default File;
