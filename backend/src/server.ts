import { createApp } from './app.js';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import { prisma } from './lib/prisma.js';

const app = createApp();
const server = app.listen(config.port, '0.0.0.0', () => {
  logger.info({ port: config.port }, 'Intent API iniciada');
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, 'Encerrando Intent API');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
