import mongoose from 'mongoose';

const ParagraphSchema = new mongoose.Schema({
  text: { type: String, required: true },
  order: { type: Number, required: true }
}, { _id: false });

const ResumeSchema = new mongoose.Schema({
  originalName: String,
  mimeType: String,
  text: String,
  email: { type: String, index: true },
  paragraphs: { type: [ParagraphSchema], default: [] },
}, { timestamps: true });


ResumeSchema.index({ uploadedAt: -1 });


export const Resume = mongoose.model('Resume', ResumeSchema);
