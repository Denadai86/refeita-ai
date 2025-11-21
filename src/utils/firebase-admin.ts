// src/utils/firebase-admin.ts
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
 * Isso resolve o erro 'Invalid PEM formatted message'.
 * * @returns A chave privada formatada ou undefined.
 */
function getFormattedPrivateKey(): string | undefined {
  const key = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!key) return undefined;

  // Substitui a sequência literal '\n' por quebras de linha reais
  // Isso é CRUCIAL para chaves PEM em arquivos .env
  return key.trim().replace(/\\n/g, '\n').replace(/\\\\n/g, '\n');
}

// ------------------------------------------------------------
// 2. Lógica de Inicialização Segura (Singleton)
// ------------------------------------------------------------

/**
 * Inicializa o Firebase Admin SDK ou retorna a instância existente.
 * 🚨 Retorna a instância do App ou undefined no caso de falha.
 */
function initializeFirebaseAdmin(): App | undefined {
  if (cachedApp) return cachedApp;

  // 1. Checa se o App já foi inicializado (importante para hot-reloading)
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

  // 2. Checagem crítica de variáveis de ambiente
  if (
    !serviceAccount.projectId ||
    !serviceAccount.clientEmail ||
    !serviceAccount.privateKey
  ) {
    console.error('--- ERRO CRÍTICO: CHAVES DO FIREBASE ADMIN INCOMPLETAS ---');
    console.error('Verifique FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, e FIREBASE_ADMIN_PRIVATE_KEY.');
    // Retorna undefined (sem lançar exceção) para que o código chamador possa lidar com a falha
    return undefined; 
  }

  // 3. Inicialização Limpa
  try {
    // Inicializa o app com as credenciais. Se o formato da chave estiver incorreto, lança erro aqui.
    cachedApp = initializeApp({
      credential: cert(serviceAccount),
    });
    console.log('Firebase Admin inicializado com sucesso.');
    return cachedApp;
  } catch (error) {
    // 🚨 Captura erro de inicialização (ex: formato de chave) e retorna undefined.
    // Esta estrutura de try/catch é mais amigável ao Turbopack.
    console.error('Erro fatal ao chamar initializeApp:', error);
    return undefined;
  }
}

// ------------------------------------------------------------
// 3. Funções de Getter (Exports)
// ------------------------------------------------------------

/**
 * Retorna a instância única do Firestore Admin.
 * @returns A instância do Firestore ou undefined se a inicialização falhar.
 */
export function getAdminDB(): Firestore | undefined {
  if (!cachedDb) {
    const app = initializeFirebaseAdmin();
    if (!app) return undefined; // Falha segura
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
    if (!app) return undefined; // Falha segura
    cachedAuth = getAuth(app);
  }
  return cachedAuth;
}

// ------------------------------------------------------------
// 4. Exportação de FieldValue (Para uso em outros arquivos)
// ------------------------------------------------------------
// Exporta FieldValue diretamente para consistência.
export { FieldValue };


// ------------------------------------------------------------
// 5. Funções Utilitárias (Se estavam no arquivo original, deixe-as aqui)
//    Se estavam em outros arquivos (recipe.server.ts), elas devem
//    usar getAdminDB() para obter a instância.
// ------------------------------------------------------------
// Exemplo de como era:
// export async function saveGeneratedRecipe(data: any): Promise<string> {
//   const adminDB = getAdminDB(); 
//   if (!adminDB) throw new Error("DB not available");
//   const doc = await adminDB.collection('generated_recipes').add({ ... });
//   return doc.id;
// }