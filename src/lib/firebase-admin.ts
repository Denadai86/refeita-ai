// src/lib/firebase-admin.ts

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * 🔒 Este arquivo só deve ser usado em Server Actions ou código server-side.
 */

// ------------------------------------------------------------
// 1. Processamento seguro da chave privada
// ------------------------------------------------------------
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ?.trim()
  .replace(/\\n/g, '\n')
  .replace(/\\\\n/g, '\n')
  .replace(/\\r/g, '\r');

// ------------------------------------------------------------
// 2. Montagem do Service Account
// ------------------------------------------------------------
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey,
};

// ------------------------------------------------------------
// 3. Inicialização única do Firebase Admin (Singleton)
// ------------------------------------------------------------
if (!getApps().length) {
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.error("ERRO CRÍTICO: Variáveis de ambiente do Firebase Admin estão incompletas!");
  } else {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
}

// Instâncias globais únicas
export const adminDB: Firestore = getFirestore(); 
export const adminAuth = getAuth();

// ------------------------------------------------------------
// 4. Lógica de Uso (Rate Limits / Plano Free)
// ------------------------------------------------------------
const MAX_FREE_RECIPES_PER_MONTH = 5;

export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const usageRef = adminDB.collection('users').doc(userId).collection('usage').doc('monthly');

  try {
    await adminDB.runTransaction(async (transaction) => {
      const snap = await transaction.get(usageRef);
      const data = snap.data() || {
        recipesGeneratedThisMonth: 0,
        lastResetTimestamp: Date.now(),
      };

      const now = Date.now();
      const monthMs = 30 * 24 * 60 * 60 * 1000;

      // Reset mensal automático
      if (!snap.exists || data.lastResetTimestamp < now - monthMs) {
        transaction.set(usageRef, {
          recipesGeneratedThisMonth: 1,
          lastResetTimestamp: now,
        });
        return;
      }

      if (data.recipesGeneratedThisMonth >= MAX_FREE_RECIPES_PER_MONTH) {
        throw new Error("usage-limit-exceeded");
      }

      transaction.update(usageRef, {
        recipesGeneratedThisMonth: data.recipesGeneratedThisMonth + 1,
      });
    });

    return true;
  } catch (err) {
    if (err instanceof Error && err.message === "usage-limit-exceeded") {
      return false;
    }
    console.error("Erro no controle de uso:", err);
    throw new Error("Falha no controle de uso do serviço.");
  }
}

// ------------------------------------------------------------
// 5. Salvamento de recipies geradas
// ------------------------------------------------------------
export async function saveGeneratedRecipe(data: any): Promise<string> {
  const doc = await adminDB.collection('generated_recipes').add({
    ...data,
    createdAt: new Date(),
  });
  return doc.id;
}
