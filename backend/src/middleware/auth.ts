import type { NextFunction, Request, Response } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { firebaseAuth } from '../lib/firebase.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors.js';

function normalizeUsername(value: string, firebaseUid: string): string {
  const base = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 20) || 'usuario';

  return `${base}_${firebaseUid.slice(0, 8).toLowerCase()}`;
}

async function verifyBearerToken(request: Request, required: boolean): Promise<DecodedIdToken | null> {
  const authorization = request.header('authorization');
  if (!authorization) {
    if (required) {
      throw new AppError(401, 'AUTH_REQUIRED', 'Entre na sua conta para continuar.');
    }
    return null;
  }

  if (!authorization.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_INVALID', 'Formato de autenticação inválido.');
  }

  const token = authorization.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Token de autenticação ausente.');
  }

  try {
    return await firebaseAuth.verifyIdToken(token, true);
  } catch {
    throw new AppError(401, 'AUTH_INVALID', 'Sua sessão não é válida ou expirou.');
  }
}

async function attachUser(request: Request, decoded: DecodedIdToken): Promise<void> {
  const tokenName = typeof decoded.name === 'string' ? decoded.name.trim() : '';
  const tokenPicture = typeof decoded.picture === 'string' ? decoded.picture : undefined;
  const normalizedEmail = typeof decoded.email === 'string' ? decoded.email.toLowerCase() : undefined;
  const displayName = tokenName || normalizedEmail?.split('@')[0] || 'Usuário Intent';

  request.auth = {
    firebaseUid: decoded.uid,
    ...(normalizedEmail ? { email: normalizedEmail } : {}),
    ...(tokenName ? { name: tokenName } : {}),
    ...(tokenPicture ? { picture: tokenPicture } : {}),
  };

  request.appUser = await prisma.user.upsert({
    where: { firebaseUid: decoded.uid },
    create: {
      firebaseUid: decoded.uid,
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      displayName,
      username: normalizeUsername(displayName, decoded.uid),
      ...(tokenPicture ? { avatarUrl: tokenPicture } : {}),
    },
    update: {
      ...(normalizedEmail ? { email: normalizedEmail } : {}),
      displayName,
      ...(tokenPicture ? { avatarUrl: tokenPicture } : {}),
    },
  });
}

async function authenticate(request: Request, required: boolean): Promise<void> {
  const decoded = await verifyBearerToken(request, required);
  if (decoded) {
    await attachUser(request, decoded);
  }
}

export async function requireAuthenticatedUser(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authenticate(request, true);
    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuthenticatedUser(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await authenticate(request, false);
    next();
  } catch (error) {
    next(error);
  }
}
