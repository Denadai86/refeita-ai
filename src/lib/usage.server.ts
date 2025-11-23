// src/lib/usage.server.ts
'use server';

// 🚨 CORREÇÃO 1: Importa FieldValue modularmente para evitar o import de 'admin' monolítico
import { FieldValue } from 'firebase-admin/firestore'; 
import { getAdminDb } from '@/utils/firebase-admin';

// Constante para o MVP de usuários FREE
const MAX_FREE_RECIPES = 10; // Mantendo seu valor atual

/**
 * Checa o uso de um usuário e incrementa a contagem, se estiver dentro do limite.
 * @returns true se permitido, false se excedeu o limite.
 */
export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
    const db = getAdminDb(); // Pega a instância do DB
    
    // 🚨 CORREÇÃO 2: Lança exceção se o DB não estiver disponível
    if (!db) {
        console.error("DB Admin não inicializado para checagem de uso.");
        // Lança exceção para que o actions.ts não mascare o erro como 'limite excedido'
        throw new Error("Erro Interno: Serviço de banco de dados indisponível.");
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
                // 🚨 CORREÇÃO 3: Usa FieldValue modular
                lastActivity: FieldValue.serverTimestamp(), 
            }, { merge: true });
        });
        
        return true; // Transação bem-sucedida
        
    } catch (error) {
        if ((error as Error).message === "Limit Exceeded") {
            return false; // Limite genuinamente excedido
        }
        
        console.error("Erro fatal na transação de uso:", error);
        // 🚨 CORREÇÃO 4: Lança exceção no caso de outros erros de DB/transação
        // Isso evita que o actions.ts reporte "Limite Excedido" por engano.
        throw new Error("Erro interno ao tentar registrar o uso no banco de dados."); 
    }
}