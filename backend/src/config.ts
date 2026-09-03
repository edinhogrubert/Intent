import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  REVEAL_ENCRYPTION_KEY: z.string().min(1),
});

const parsed = environmentSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(`Configuração inválida. Verifique: ${missing}`);
}

const encryptionKey = Buffer.from(parsed.data.REVEAL_ENCRYPTION_KEY, 'base64');
if (encryptionKey.length !== 32) {
  throw new Error('REVEAL_ENCRYPTION_KEY deve conter exatamente 32 bytes em Base64.');
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  logLevel: parsed.data.LOG_LEVEL,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean),
  databaseUrl: parsed.data.DATABASE_URL,
  firebaseProjectId: parsed.data.FIREBASE_PROJECT_ID,
  revealEncryptionKey: encryptionKey,
};
