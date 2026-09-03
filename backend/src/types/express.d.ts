import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        firebaseUid: string;
        email?: string;
        name?: string;
        picture?: string;
      };
      appUser?: User;
    }
  }
}

export {};
