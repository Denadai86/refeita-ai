// Refeita.AI/src/lib/recipe.server.ts
'use server';

import 'server-only'; // Garante que este arquivo só rode no servidor
import { adminDb } from '@/utils/firebase-admin'; 
import { GeneratedRecipe } from '@/types/recipe';
// Importa o tipo do Admin SDK
import type { DocumentData } from 'firebase-admin/firestore'; 
import { notFound } from 'next/navigation';


/**
 * Busca um lote de receitas no Firestore pelo ID.
 * Chamada apenas em Server Components (page.tsx) ou Server Actions.
 * @param batchId O ID do documento do lote de receitas.
 * @returns O objeto GeneratedRecipe ou null.
 */
export async function getRecipeBatchById(batchId: string): Promise<GeneratedRecipe> {
    
    if (!adminDb || !batchId) {
        // Se a base de dados não estiver inicializada ou o ID for inválido, tratar como 404
        notFound();
    }

    try {
        const docRef = adminDb!.collection('recipeBatches').doc(batchId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.warn(`Lote de receitas com ID ${batchId} não encontrado.`);
            notFound(); // Aciona a página not-found do Next.js
        }

        const data = doc.data() as DocumentData;

        // O Firestore Admin SDK retorna Timestamps. Converte para Date.
        const recipeBatch: GeneratedRecipe = {
            id: doc.id,
            userId: data.userId || null, 
            inputData: data.inputData,
            generatedRecipes: data.generatedRecipes,
            // Converte o Timestamp do Admin SDK para um objeto JavaScript Date
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt, 
        };

        return recipeBatch;

    } catch (error) {
        console.error(`Erro ao buscar lote de receitas ${batchId}:`, error);
        // Em caso de qualquer erro de IO ou acesso, tratamos como não encontrado por segurança
        notFound(); 
    }
}