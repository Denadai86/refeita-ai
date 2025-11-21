// src/lib/usage.server.ts
'use server';

import admin from 'firebase-admin'; // Para usar FieldValue.serverTimestamp()
import { getAdminDB } from '@/utils/firebase-admin';

// Constante para o MVP de usuários FREE
const MAX_FREE_RECIPES = 5;

/**
 * Checa o uso de um usuário e incrementa a contagem, se estiver dentro do limite.
 * Esta função agora é independente do arquivo de inicialização.
 * @returns true se permitido, false se excedeu o limite.
 */
export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
    const db = await getAdminDB(); // Pega a instância do DB
    if (!db) {
        console.error("DB Admin não inicializado para checagem de uso.");
        return true; // Falha segura temporária
    }

    const today = new Date().toISOString().substring(0, 10); // 'YYYY-MM-DD'
    const usageRef = db.collection('userUsage').doc(userId);

    try {
        await db.runTransaction(async (transaction) => {
            const usageDoc = await transaction.get(usageRef);
            const data = usageDoc.data();
            
            // Inicializa ou pega a contagem diária
            const currentCount = data?.[today] || 0; 

            if (currentCount >= MAX_FREE_RECIPES) {
                // Se excedeu o limite, lança erro para abortar a transação
                throw new Error("Limit Exceeded"); 
            }

            // Incrementa a contagem
            const newCount = currentCount + 1;
            
            // Atualiza o documento
            transaction.set(usageRef, {
                ...data,
                [today]: newCount,
                lastActivity: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        });
        
        return true; // Transação bem-sucedida
        
    } catch (error) {
        if ((error as Error).message === "Limit Exceeded") {
            return false; // Limite excedido
        }
        console.error("Erro na transação de uso:", error);
        return false; // Outro erro no DB
    }
}