import multer from 'multer';
import { loadEnv } from '../configs/serverConfig.js';

const env = loadEnv();

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
}

export const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.MAX_FILE_SIZE }
});
