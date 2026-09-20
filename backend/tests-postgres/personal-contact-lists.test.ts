import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { prisma } from '../src/lib/prisma.js';
import { createPersonalContactList, addPersonalContactListMember, removePersonalContactListMember, listPersonalContactLists } from '../src/services/personal-contact-list-service.js';
import { createIntent } from '../src/services/intent-service.js';

let ownerId: string;
let memberId: string;
let inactiveId: string;

beforeAll(async () => {
  execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'pipe' });
  const marker = randomUUID();
  const users = await Promise.all([
    prisma.user.create({ data: { firebaseUid: `lists-owner-${marker}`, username: `lists_owner_${marker.slice(0, 8)}`, displayName: 'Owner' } }),
    prisma.user.create({ data: { firebaseUid: `lists-member-${marker}`, username: `lists_member_${marker.slice(0, 8)}`, displayName: 'Member' } }),
    prisma.user.create({ data: { firebaseUid: `lists-inactive-${marker}`, username: `lists_inactive_${marker.slice(0, 8)}`, displayName: 'Inactive', status: 'SUSPENDED' } }),
  ]);
  ownerId = users[0]!.id; memberId = users[1]!.id; inactiveId = users[2]!.id;
});

afterAll(async () => { await prisma.$disconnect(); });

describe('listas pessoais em PostgreSQL', () => {
  it('persiste CRUD, unicidade por nome normalizado e membros idempotentes', async () => {
    const list = await createPersonalContactList(ownerId, '  Minha  Lista ');
    await expect(createPersonalContactList(ownerId, 'minha lista')).rejects.toMatchObject({ code: 'P2002' });
    await addPersonalContactListMember(ownerId, list.id, memberId);
    await addPersonalContactListMember(ownerId, list.id, memberId);
    const listed = await listPersonalContactLists(ownerId);
    expect(listed.find((item) => item.id === list.id)?.members.map((item) => item.id)).toEqual([memberId]);
    await expect(addPersonalContactListMember(ownerId, list.id, inactiveId)).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
    await removePersonalContactListMember(ownerId, list.id, memberId);
    expect((await listPersonalContactLists(ownerId)).find((item) => item.id === list.id)?.members).toEqual([]);
  });

  it('expande membros ativos para snapshot de guardianIds na criação', async () => {
    const list = await createPersonalContactList(ownerId, `Snapshot ${randomUUID().slice(0, 8)}`);
    await addPersonalContactListMember(ownerId, list.id, memberId);
    const current = await listPersonalContactLists(ownerId);
    const intent = await createIntent(ownerId, { title: 'Snapshot', story: 'Lista vira UUID', visibility: 'PRIVATE', conditionType: 'GUARDIANS', guardianIds: current.find((item) => item.id === list.id)!.members.map((item) => item.id), guardianApprovalGoal: 1, revealContent: 'Protegido' });
    expect(intent.guardianIds).toEqual([memberId]);
    await removePersonalContactListMember(ownerId, list.id, memberId);
    const persisted = await prisma.intent.findUnique({ where: { id: intent.id }, select: { guardianIds: true } });
    expect(persisted?.guardianIds).toEqual([memberId]);
  });
});
