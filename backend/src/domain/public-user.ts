import type { Prisma, User } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  username: true,
  displayName: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Pick<
  User,
  'id' | 'username' | 'displayName' | 'bio' | 'avatarUrl' | 'createdAt' | 'updatedAt'
>;

export function toPublicUser(user: PublicUser): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
