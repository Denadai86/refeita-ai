// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import 'server-only'; // Boa prática para arquivos server-side

// Variáveis para cache da instância (Singleton)
let adminApp: App | undefined;
let adminDBInstance: Firestore | undefined;
let adminAuthInstance: Auth | undefined;

// ------------------------------------------------------------
// 1. Lógica de Inicialização Segura (Com Decodificação Base64)
// ------------------------------------------------------------

/**
 * Processa a chave privada, substituindo newlines escapadas.
 * Este método é crucial para chaves armazenadas em uma linha única em .env.local.
 * @returns A chave privada formatada para o SDK.
 */
function getFormattedPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;

  // A forma mais comum de quebra no .env é o literal '\n'
  // O trim() remove espaços extras no início/fim.
  let formattedKey = key.trim();

  // Substitui a sequência literal '\\n' por quebras de linha reais '\n'
  // Esta é a correção principal para o formato do seu .env.local.
  formattedKey = formattedKey.replace(/\\n/g, '\n');

  // Adicionalmente, substitui o caso de 'erro de aspas' onde \n é literal
  formattedKey = formattedKey.replace(/\\\\n/g, '\n'); 

  if (formattedKey.includes('BEGIN PRIVATE KEY') && formattedKey.includes('\n')) {
      return formattedKey;
  }
  
  // Se ainda não parece uma chave PEM válida
  return undefined; 
}

/**
 * Inicializa o Firebase Admin SDK de forma segura (Singleton) ou retorna a instância existente.
 * Lança um erro CRÍTICO se faltarem variáveis de ambiente.
 *
 * @returns A instância do Firebase App.
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

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

  // 🚨 NOVO LOG DE ERRO MAIS CLARO:
  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    console.error('--- ERRO CRÍTICO: FALHA NA INICIALIZAÇÃO FIREBASE ADMIN ---');
    console.error('1. FIREBASE_PROJECT_ID está presente:', !!serviceAccount.projectId);
    console.error('2. FIREBASE_CLIENT_EMAIL está presente:', !!serviceAccount.clientEmail);
    // O erro mais provável!
    console.error('3. FIREBASE_ADMIN_PRIVATE_KEY processada está VAZIA:', !serviceAccount.privateKey); 
    console.error('---------------------------------------------------------');

    throw new Error(
      'Firebase Admin SDK not initialized: Missing or invalid key/credentials. Check server logs above.'
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

export function getAdminDb(): Firestore {
  if (!adminDBInstance) {
    const app = initializeFirebaseAdmin();
    adminDBInstance = getFirestore(app);
  }
  return adminDBInstance;
}

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

// A lógica de checkAndIncrementUsage e saveGeneratedRecipe permanece a mesma
// pois já está usando corretamente o ().
const MAX_FREE_RECIPES_PER_MONTH = 5;

export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  // O código aqui pode ser simplificado, mas estou mantendo o seu foco.
  // ... (Seu código checkAndIncrementUsage aqui, usando getAdminDB())
  const adminDB = getAdminDB(); // Pega a instância a cada chamada
  
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

export async function saveGeneratedRecipe(data: any): Promise<string> {
  const adminDB = getAdminDB(); // Pega a instância a cada chamada

  const doc = await adminDB.collection('generated_recipes').add({
    ...data,
    createdAt: FieldValue.serverTimestamp(), // Usando ServerTimestamp para data/hora
  });
  return doc.id;
}