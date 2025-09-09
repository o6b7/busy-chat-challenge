import express from 'express';
import { chatWithResume } from '../controllers/chatController.js';
import { validateChatInput } from '../middlewares/validateMiddleware.js';

const router = express.Router();

/**
 * POST /api/chat
 * body: { resumeId, question }
 */
router.post('/', validateChatInput, chatWithResume);

export default router;
