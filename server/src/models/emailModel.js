import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: String,
  body: String,
  status: { type: String, enum: ["sent","failed"], default: "sent" },
  error: String,
}, { timestamps: true });


export const EmailLog = mongoose.model('EmailLog', EmailSchema);
