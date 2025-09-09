import express from 'express';
import { uploadResume, getResumeInfo, listResumes, deleteResume } from '../controllers/resumeController.js';
import { resumeUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', resumeUpload.single('file'), uploadResume);
router.get('/', getResumeInfo);
router.get('/list', listResumes);
router.delete('/:id', deleteResume);


export default router;
