import express from 'express';
import { sendEmail } from '../controllers/emailController.js';
import { validateEmailInput } from '../middlewares/validateMiddleware.js';
import { EmailLog } from '../models/emailModel.js';

const router = express.Router();

router.post("/send", validateEmailInput, sendEmail);

// New: fetch last 20 email logs
router.get("/logs", async (req, res, next) => {
  try {
    const logs = await EmailLog.find().sort({ createdAt: -1 }).limit(20).lean();
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

export default router;
