import { Resume } from "../models/resumeModel.js";
import { parseFile } from "../utils/parser.js";
import { splitToParagraphs } from "../utils/parser.js";

// POST /api/resume/upload
export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Extract text from PDF/Doc
    const text = await parseFile(req.file);

    // Convert paragraphs into objects with { text, order }
    const rawParagraphs = splitToParagraphs(text);
    const paragraphs = rawParagraphs.map((p, i) => ({
      text: p,
      order: i,
    }));

    // Simple regex to extract first email found
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : null;

    const newResume = new Resume({
    text,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    paragraphs,
    uploadedAt: new Date(),
    email, // 👈 save email
    });


    await newResume.save();

    res.json({
      resumeId: newResume._id,
      originalName: newResume.originalName,
      uploadedAt: newResume.uploadedAt,
    });
  } catch (err) {
    next(err);
  }
}

// getResumeInfo - returns latest uploaded resume meta
export async function getResumeInfo(req, res, next) {
  try {
    const doc = await Resume.findOne().sort({ uploadedAt: -1 }).lean();
    if (!doc) return res.status(404).json({ error: 'No resume uploaded yet' });

    res.json({
      resumeId: doc._id,
      originalName: doc.originalName,
      uploadedAt: doc.uploadedAt,
      paragraphCount: doc.paragraphs.length,
      email: doc.email || null,
    });
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req, res, next) {
  try {
    const docs = await Resume.find({})
      .sort({ uploadedAt: -1 })
      .lean();

    res.json(
      docs.map((doc) => ({
        resumeId: doc._id,
        originalName: doc.originalName,
        uploadedAt: doc.uploadedAt,
        paragraphCount: doc.paragraphs.length,
        email: doc.email || null,
      }))
    );
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resume/:id
export async function deleteResume(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Resume.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Resume not found" });
    }

    res.json({ message: "Resume deleted successfully", resumeId: id });
  } catch (err) {
    next(err);
  }
}
