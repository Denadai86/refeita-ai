// src/utils/firebase-admin.ts
'use server';

import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';

const APP_NAME = 'refeita-ai-admin';
let cachedDb: Firestore | null = null;

function initializeFirebaseAdmin(): Firestore | null {
  if (cachedDb) return cachedDb;

  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

  if (!base64Key) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 não encontrada. Admin desativado.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(
      Buffer.from(base64Key, 'base64').toString('utf-8')
    );

    const existingApp = admin.apps.find(app => app?.name === APP_NAME);
    if (existingApp) {
      cachedDb = existingApp.firestore();
    } else {
      const newApp = admin.initializeApp(
        {
          credential: admin.credential.cert(serviceAccount),
        },
        APP_NAME
      );
      cachedDb = newApp.firestore();
    }

    console.log('Firebase Admin inicializado com sucesso');
    return cachedDb;
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin:', error);
    return null;
  }
}

// ÚNICA exportação que você vai usar daqui pra frente
export async function getAdminDb(): Promise<Firestore | null> {
  return initializeFirebaseAdmin();
}