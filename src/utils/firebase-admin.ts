// Refeita.AI/src/utils/firebase-admin.ts
'use server'; 

import * as admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
// O tipo ServiceAccount já está disponível no namespace 'admin', mas a importação direta funciona.
import { ServiceAccount } from 'firebase-admin'; 

// 🛑 MUDANÇA 1: Novo nome da variável de ambiente (Esperando string Base64)
const SERVICE_ACCOUNT_KEY_BASE64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
const APP_NAME = 'refeita-ai-admin';

// Variáveis internas
let adminApp: admin.app.App | null = null;
let _adminDb: Firestore | null = null; 

function initializeFirebaseAdmin() {
    // 1. Já inicializado (singleton pattern)
    if (adminApp && _adminDb) return;

    // 2. Verifica a chave Base64 no .env
    if (!SERVICE_ACCOUNT_KEY_BASE64) {
        console.warn("⚠️ Variável FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 ausente. O Firestore Admin está desativado.");
        _adminDb = null;
        return;
    }

    try {
        // 3. CRÍTICO: Decodifica a string Base64 de volta para uma string JSON pura.
        // O Node.js/V8 tem a classe Buffer globalmente disponível.
        const serviceAccountString = Buffer.from(SERVICE_ACCOUNT_KEY_BASE64, 'base64').toString('utf-8');
        
        // 4. Faz o parse do JSON decodificado.
        // Esta string agora deve estar limpa e conter os caracteres de quebra de linha corretos.
        const serviceAccount = JSON.parse(serviceAccountString) as admin.ServiceAccount;
        
        // 5. Inicialização (Mantida sua lógica de checagem de app)
        if (admin.apps.some(app => app && app.name === APP_NAME)) {
            adminApp = admin.app(APP_NAME);
        } else {
            adminApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            }, APP_NAME);
        }
        
        // 6. Atribui o DB à variável interna
        _adminDb = adminApp.firestore();
        console.log("🔥 Firebase Admin SDK inicializado com sucesso.");

    } catch (e) {
        console.error(`❌ ERRO fatal ao inicializar o Admin SDK.`, e);
        // O erro 'Invalid PEM formatted message' deve ser resolvido por esta correção.
        _adminDb = null;
    }
}

// Executa a inicialização na primeira importação
initializeFirebaseAdmin();

/**
 * 🎯 Exporta uma função ASYNC (assíncrona) que retorna a instância do Firestore.
 * @returns Instância do Firestore Admin ou null.
 */
export async function getAdminDb(): Promise<Firestore | null> {
    // Retorna a variável interna que foi inicializada.
    return _adminDb;
}

