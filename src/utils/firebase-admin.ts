// src/utils/firebase-admin.ts (ou src/lib/firebase-admin.ts)
import { initializeApp, getApps, cert, App, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import 'server-only'; 

/**
 * 🔒 Arquivo de inicialização do Firebase Admin SDK.
 * Usa o padrão Singleton (Lazy-Loading) para instâncias seguras.
 */

// Variáveis para cache da instância (Singleton)
let cachedApp: App | undefined;
let cachedDb: Firestore | undefined;
let cachedAuth: Auth | undefined;

// ------------------------------------------------------------
// 1. Lógica de Processamento de Chaves
// ------------------------------------------------------------

/**
 * Processa a chave privada (Private Key) da variável de ambiente.
 * Substitui sequências de escape comuns (\n) por quebras de linha reais.
 * @returns A chave privada formatada ou undefined.
 */
function getFormattedPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;

  // Substitui a sequência literal '\\n' por quebras de linha reais '\n'
  // CRUCIAL para o formato de chave do .env.local
  return key.trim().replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
}

// ------------------------------------------------------------
// 2. Lógica de Inicialização Segura (Singleton)
// ------------------------------------------------------------

/**
 * Inicializa o Firebase Admin SDK ou retorna a instância existente.
 * Retorna a instância do App ou undefined no caso de falha.
 */
function initializeFirebaseAdmin(): App | undefined {
  if (cachedApp) return cachedApp;

  // Checa se o App já foi inicializado
  const existingApp = getApps().find(app => app.name === '[DEFAULT]');
  if (existingApp) {
    cachedApp = existingApp;
    return cachedApp;
  }

  const privateKey = getFormattedPrivateKey();

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };

  // Checagem crítica de variáveis de ambiente
  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    console.error('--- ERRO CRÍTICO: CHAVES DO FIREBASE ADMIN INCOMPLETAS ---');
    console.error('Verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, e FIREBASE_ADMIN_PRIVATE_KEY.');
    return undefined; // Falha segura
  }

  // Inicialização Limpa com tratamento de erro
  try {
    cachedApp = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin inicializado com sucesso.');
    return cachedApp;
  } catch (error) {
    console.error('Erro fatal ao chamar initializeApp:', error);
    return undefined;
  }
}

// ------------------------------------------------------------
// 3. Funções de Getter (Exports)
// ------------------------------------------------------------

/**
 * Retorna a instância única do Firestore Admin. (getAdminDb - minúsculo)
 * @returns A instância do Firestore ou undefined se a inicialização falhar.
 */
export function getAdminDb(): Firestore | undefined {
  if (!cachedDb) {
    const app = initializeFirebaseAdmin();
    if (!app) return undefined; 
    cachedDb = getFirestore(app);
  }
  return cachedDb;
}

/**
 * Retorna a instância única do Auth Admin.
 * @returns A instância do Auth ou undefined se a inicialização falhar.
 */
export function getAdminAuth(): Auth | undefined {
  if (!cachedAuth) {
    const app = initializeFirebaseAdmin();
    if (!app) return undefined; 
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

// ------------------------------------------------------------
// 4. Exportação de FieldValue
// ------------------------------------------------------------
export { FieldValue };