import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host) {
    throw new Error('SMTP_HOST not configured in env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}
