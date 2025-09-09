import { createApp } from './app.js';
import { loadEnv, connectDB } from './configs/serverConfig.js';
import { logger } from './configs/loggerConfig.js';

const env = loadEnv();
const app = createApp();

async function start() {
  try {
    await connectDB(env.MONGO_URI, logger);

    const port = env.PORT;
    app.listen(port, () => {
      logger.info(`MCP server listening on port ${port} (env: ${env.NODE_ENV})`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

