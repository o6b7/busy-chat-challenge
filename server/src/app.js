import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json, urlencoded } from 'express';
import resumeRoutes from './routes/resumeRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-frontend-domain.com' 
      : 'http://localhost:3001',
    credentials: true
  }));
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true }));

  app.use('/api/v1/resume', resumeRoutes);
  app.use('/api/v1/email', emailRoutes);
  app.use('/api/v1/chat', chatRoutes);

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
