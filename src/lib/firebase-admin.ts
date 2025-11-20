// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import 'server-only'; // Boa prática para arquivos server-side

/**
 * 🔒 Este arquivo só deve ser usado em Server Actions ou código server-side.
 * Ele implementa a inicialização robusta do Firebase Admin SDK usando o padrão Singleton (Lazy-Loading).
 */

// Variáveis para cache da instância (Singleton)
let adminApp: App | undefined;
let adminDBInstance: Firestore | undefined;
let adminAuthInstance: Auth | undefined;

// ------------------------------------------------------------
// 1. Lógica de Inicialização Segura (Com Decodificação Base64)
// ------------------------------------------------------------

/**
 * Processa a chave privada: tenta decodificar de Base64 e,
 * como fallback, tenta o formato RAW com newlines escapadas.
 * @returns A chave privada formatada.
 */
function getFormattedPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;

  const trimmedKey = key.trim();

  // 1. Tenta decodificar de Base64 (a chave que você forneceu está neste formato)
  // Checa se a chave não contém newlines ou newlines escapadas, o que sugere Base64.
  if (
    !trimmedKey.includes('\n') &&
    !trimmedKey.includes('\\n') &&
    trimmedKey.length > 100
  ) {
    try {
      // 'Buffer' está disponível em ambientes Node.js (Server Actions)
      const decoded = Buffer.from(trimmedKey, 'base64').toString('utf8');
      if (decoded.includes('BEGIN PRIVATE KEY')) {
        return decoded;
      }
    } catch (e) {
      // Ignora erro e tenta o próximo formato
    }
  }

  // 2. Se a decodificação Base64 falhou, trata como string RAW (com newlines escapadas)
  return trimmedKey.replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
}

/**
 * Inicializa o Firebase Admin SDK de forma segura (Singleton) ou retorna a instância existente.
 * @returns A instância do Firebase App.
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  // Tenta obter a instância existente (se já foi inicializada por outra chamada getApps().length > 0)
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const privateKey = getFormattedPrivateKey();

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };

  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    console.error(
      'ERRO CRÍTICO: Variáveis de ambiente do Firebase Admin estão incompletas!'
    );
    throw new Error(
      'Firebase Admin SDK not initialized: Missing environment variables.'
    );
  }

  adminApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return adminApp;
}

// ------------------------------------------------------------
// 2. Funções de Getter (Lazy Initialization)
// ------------------------------------------------------------

/**
 * Retorna a instância única do Firestore Admin, inicializando-o se necessário.
 */
export function getAdminDb(): Firestore {
  if (!adminDBInstance) {
    const app = initializeFirebaseAdmin();
    adminDBInstance = getFirestore(app);
  }
  return adminDBInstance;
}

/**
 * Retorna a instância única do Auth Admin, inicializando-o se necessário.
 */
export function getAdminAuth(): Auth {
  if (!adminAuthInstance) {
    const app = initializeFirebaseAdmin();
    adminAuthInstance = getAuth(app);
  }
  return adminAuthInstance;
}

// ------------------------------------------------------------
// 3. Lógica de Uso (Rate Limits / Plano Free)
// ------------------------------------------------------------
const MAX_FREE_RECIPES_PER_MONTH = 5;

/**
 * Checa o limite de uso mensal de receitas e incrementa a contagem.
 * Usa uma transação para garantir atomicidade.
 * * @param userId ID do usuário.
 * @returns Promise<boolean> true se permitido, false se limite excedido.
 */
export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const adminDB = getAdminDb(); // Pega a instância a cada chamada

  const usageRef = adminDB
    .collection('users')
    .doc(userId)
    .collection('usage')
    .doc('monthly');

  try {
    await adminDB.runTransaction(async (transaction) => {
      const snap = await transaction.get(usageRef);
      const data = snap.data() || {
        recipesGeneratedThisMonth: 0,
        lastResetTimestamp: FieldValue.serverTimestamp(),
      };

      // Tenta obter o timestamp, convertendo o ServerTimestamp para milissegundos
      const lastResetMs = (data.lastResetTimestamp as any)?.toDate
        ? (data.lastResetTimestamp as any).toDate().getTime()
        : Date.now();

      const now = Date.now();
      const monthMs = 30 * 24 * 60 * 60 * 1000;

      // Reset mensal automático (com tolerância de 30 dias)
      if (!snap.exists || lastResetMs < now - monthMs) {
        transaction.set(usageRef, {
          recipesGeneratedThisMonth: 1,
          lastResetTimestamp: FieldValue.serverTimestamp(),
        });
        return;
      }

      if (data.recipesGeneratedThisMonth >= MAX_FREE_RECIPES_PER_MONTH) {
        throw new Error('usage-limit-exceeded');
      }

      // Incrementa a contagem de forma segura
      transaction.update(usageRef, {
        recipesGeneratedThisMonth: FieldValue.increment(1),
      });
    });

    return true; // Uso permitido e incrementado
  } catch (err) {
    if (err instanceof Error && err.message === 'usage-limit-exceeded') {
      return false; // Limite excedido
    }
    console.error('Erro no controle de uso:', err);
    throw new Error('Falha no controle de uso do serviço.');
  }
}

// ------------------------------------------------------------
// 4. Salvamento de recipies geradas
// ------------------------------------------------------------

/**
 * Salva uma receita gerada na coleção 'generated_recipes'.
 * @param data O payload da receita.
 * @returns Promise<string> O ID do documento salvo.
 */
export async function saveGeneratedRecipe(data: any): Promise<string> {
  const adminDB = getAdminDb(); // Pega a instância a cada chamada

  const doc = await adminDB.collection('generated_recipes').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(), // Usando ServerTimestamp para data/hora
  });
  return doc.id;
}