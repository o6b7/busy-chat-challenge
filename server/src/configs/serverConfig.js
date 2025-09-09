import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const schema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGO_URI: Joi.string().uri().required(),
  MAX_FILE_SIZE: Joi.number().default(5 * 1024 * 1024),
  OPENAI_API_KEY: Joi.string().optional()
}).unknown(true);

export function loadEnv() {
  const { value, error } = schema.validate(process.env, { allowUnknown: true });
  if (error) throw new Error(`Config validation error: ${error.message}`);
  return value;
}

export async function connectDB(mongoUri, logger) {
  try {
    await mongoose.connect(mongoUri);
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('❌ MongoDB connection error', err);
    throw err;
  }
}
