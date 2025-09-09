import express from 'express';
import { uploadResume, getResumeInfo, listResumes } from '../controllers/resumeController.js';
import { resumeUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

/**
 * POST /api/resume/upload
 * form-data field: file
 */
router.post('/upload', resumeUpload.single('file'), uploadResume);

/**
 * GET /api/resume
 * Returns metadata about the latest resume
 */
router.get('/', getResumeInfo);

router.get('/list', listResumes);


export default router;
