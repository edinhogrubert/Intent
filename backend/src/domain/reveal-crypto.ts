import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface SealedReveal {
  ciphertext: string;
  iv: string;
  authTag: string;
}

const ALGORITHM = 'aes-256-gcm';

export function sealReveal(plaintext: string, key: Buffer, associatedData: string): SealedReveal {
  if (key.length !== 32) {
    throw new Error('A chave de revelação deve possuir 32 bytes.');
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from(associatedData, 'utf8'));

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function openReveal(sealed: SealedReveal, key: Buffer, associatedData: string): string {
  if (key.length !== 32) {
    throw new Error('A chave de revelação deve possuir 32 bytes.');
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(sealed.iv, 'base64'));
  decipher.setAAD(Buffer.from(associatedData, 'utf8'));
  decipher.setAuthTag(Buffer.from(sealed.authTag, 'base64'));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, 'base64')),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function revealAssociatedData(intentId: string, version: number): string {
  return `intent:${intentId}:reveal:v${version}`;
}
