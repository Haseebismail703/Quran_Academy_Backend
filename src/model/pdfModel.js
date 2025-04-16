import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String },
  publicId: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const Pdf = mongoose.model('Pdf', pdfSchema);
export default Pdf;
