// Web Crypto API implementation for AES-256-GCM Encryption & Decryption (Etapa 6)

export interface ProtectedPayload {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  cipherText: string;
  cipherAlg: 'AES-256-GCM';
  salt: string;
  iv: string;
  fingerprint: string; // SHA-256 checksum of original content
  encryptedAt: string;
  isEncrypted: boolean;
  decryptedContent?: string; // Available only post-decryption
}

const DEFAULT_VAULT_KEY = 'INTENT_VAULT_DEFAULT_SECRET_KEY_2026';

// Helper: Convert array buffer to hex string
function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert hex string to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

// Derive AES-256-GCM CryptoKey using PBKDF2
async function deriveKey(passphrase: string, saltBytes: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passphraseKey,
    { name: 'AES-256-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate SHA-256 fingerprint for verification
export async function generateFingerprint(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return '0x' + buf2hex(hashBuffer).slice(0, 24);
}

// Encrypt text / file string payload using AES-256-GCM
export async function encryptPayload(
  content: string,
  fileName = 'segredo_cofre.txt',
  fileType = 'text/plain',
  passphrase = DEFAULT_VAULT_KEY
): Promise<ProtectedPayload> {
  const encoder = new TextEncoder();
  const encodedContent = encoder.encode(content);

  // Generate random Salt (16 bytes) and IV (12 bytes for AES-GCM)
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  // Derive key & encrypt
  const key = await deriveKey(passphrase, salt);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-256-GCM', iv },
    key,
    encodedContent
  );

  const cipherText = buf2hex(encryptedBuffer);
  const fingerprint = await generateFingerprint(content);

  return {
    id: 'enc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
    fileName,
    fileSize: encodedContent.byteLength,
    fileType,
    cipherText,
    cipherAlg: 'AES-256-GCM',
    salt: buf2hex(salt),
    iv: buf2hex(iv),
    fingerprint,
    encryptedAt: new Date().toISOString(),
    isEncrypted: true,
  };
}

// Decrypt ciphertext back to original string
export async function decryptPayload(
  payload: ProtectedPayload,
  passphrase = DEFAULT_VAULT_KEY
): Promise<string> {
  try {
    const salt = hex2buf(payload.salt);
    const iv = hex2buf(payload.iv);
    const cipherBuffer = hex2buf(payload.cipherText);

    const key = await deriveKey(passphrase, salt);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-256-GCM', iv },
      key,
      cipherBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Falha na descriptografia AES-256: Chave inválida ou payload corrompido.');
  }
}

// Helper: Convert File to Base64/DataURL
export function readFileAsTextOrDataUrl(file: File): Promise<{ content: string; name: string; size: number; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        content: reader.result as string,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
      });
    };
    reader.onerror = reject;

    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  });
}

// Preset Sample Files for Quick Demo in Etapa 6
export const SAMPLE_PROTECTED_FILES = [
  {
    name: 'Contrato_Cofre_Estrategico_2026.pdf',
    type: 'application/pdf',
    size: 245800,
    content: '📄 [DOCUMENTO CONFIDENCIAL - CLASSIFICAÇÃO MÁXIMA]\n\nCláusula 1: Transferência de custódia e liberação de fundos atrelada ao cumprimento do quórum de 2/3 guardiões e data limite de maturação.\nCláusula 2: Chave Mestra de Acesso: 0x98A7F6E5D4C3B2A10987654321',
  },
  {
    name: 'Chaves_Públicas_e_Privadas_Alfa.txt',
    type: 'text/plain',
    size: 4200,
    content: '🔑 CHAVES DE SEGURANÇA BANCÁRIA:\n- Key_ID: ALFA-99238\n- Private_Token: ed25519_sk_983f219a0029bce8371a\n- Validação: Assinatura tripla validada pela Dra. Helena Voss e Carlos Mendez.',
  },
];
