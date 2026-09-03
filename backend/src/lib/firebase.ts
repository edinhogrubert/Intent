import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { config } from '../config.js';

const firebaseApp = getApps()[0] ?? initializeApp({ projectId: config.firebaseProjectId });

export const firebaseAuth = getAuth(firebaseApp);
