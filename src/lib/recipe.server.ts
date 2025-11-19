'use server';

import 'server-only'; 
// CORREÇÃO: Altera a importação de 'adminDb' (erro) para 'adminDB' (correto)
import { adminDB } from '@/utils/firebase-admin'; 
import { GeneratedRecipe } from '@/types/recipe';
import type { DocumentData } from 'firebase-admin/firestore'; 
import { notFound } from 'next/navigation';


/**
 * Busca um lote de receitas no Firestore pelo ID.
 * Chamada apenas em Server Components (page.tsx) ou Server Actions.
 * @param batchId O ID do documento do lote de receitas.
 * @returns O objeto GeneratedRecipe ou null.
 */
export async function getRecipeBatchById(batchId: string): Promise<GeneratedRecipe> {
    
    // Boa prática: A validação adminDB || !batchId é redundante, 
    // pois a inicialização ocorre globalmente em firebase-admin.ts, 
    // mas mantê-la como verificação de segurança é aceitável.
    if (!adminDB || !batchId) {
        notFound();
    }

    try {
        // Uso de 'adminDB' corrigido
        const docRef = adminDB.collection('recipeBatches').doc(batchId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.warn(`Lote de receitas com ID ${batchId} não encontrado.`);
            notFound(); 
        }

        const data = doc.data() as DocumentData;

        // Mapeamento e conversão de Timestamp
        const recipeBatch: GeneratedRecipe = {
            id: doc.id,
            userId: data.userId || null, 
            inputData: data.inputData,
            generatedRecipes: data.generatedRecipes,
            // O uso de `data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt`
            // é bom para garantir a conversão, caso o campo não seja um Timestamp.
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt, 
        };

        return recipeBatch;

    } catch (error) {
        console.error(`Erro ao buscar lote de receitas ${batchId}:`, error);
        // Tratamento de erro robusto.
        notFound(); 
    }
}