// src/app/actions.ts
'use server';

//import { auth } from '@/app/api/auth/[...nextauth]/route'; // Importa a função auth() (local)
import { getServerSession } from 'next-auth'
import { auth as authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateRecipe } from '@/lib/llm'; // Função de chamada da IA
import { getAdminDB } from '@/lib/firebase-admin'; // Firestore Admin Instance
// Importa o tipo correto 'RecipeInput' e o payload para salvar no DB
import { RecipeActionState, RecipeInput, RecipeBatchPayload, RecipeResponse } from '@/types/recipe'; 
import { checkAndIncrementUsage } from '@/lib/usage.server';

// Constante para o MVP de usuários FREE
const MAX_FREE_RECIPES = 5;

/**
 * Server Action principal para receber o formulário, checar limites,
 * gerar a receita via LLM e salvar no Firestore.
 */
export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {

  const session = await getServerSession(authOptions as any);
  
  // 🚨 CORREÇÃO ESSENCIAL: Declaração de userId e userPlan no escopo da função
  const userId = (session as any)?.user?.id || null; // Null se não estiver logado
  const userPlan = (session as any)?.user?.plan || 'FREE';

  try {
    // -------------------------------------------------
    // 1. LER E VALIDAR INPUTS DO FORMULÁRIO
    // -------------------------------------------------
    // 🚨 ATENÇÃO: Verifique a nomenclatura exata dos campos 'mainIngredients' vs 'ingredients'
    const input: RecipeInput = {
      mainIngredients: formData.get('mainIngredients')?.toString() || '',
      restrictions: formData.get('restrictions')?.toString() || '',
      prepTimePreference: formData.get('prepTimePreference')?.toString() as any, // Cuidado com 'as any'
      cuisinePreference: formData.get('cuisinePreference')?.toString() || '',
      numberOfRecipes: 1, 
    };

    if (input.mainIngredients.split(',').filter(s => s.trim().length > 0).length < 2) {
      return { success: false, message: 'Inclua ao menos 2 ingredientes válidos.' };
    }

    // -------------------------------------------------
    // 2. RATE LIMIT (MVP de Monetização)
    // -------------------------------------------------
    if (userPlan === 'FREE' && userId) {
        const allowed = await checkAndIncrementUsage(userId);
        if (!allowed) {
            return { 
                success: false, 
                message: `Limite de ${MAX_FREE_RECIPES} receitas gratuitas atingido. Faça upgrade para continuar!` 
            };
        }
    }
    
    // -------------------------------------------------
    // 3. CONVERTER O TEMPO E CHAMAR O LLM
    // -------------------------------------------------
    const timeMap: Record<string, number> = {
      'SuperRápido(até 15min)': 15,
      'Rápido (até 30min)': 30,
      'Normal (30-60min)': 60,
      'Qualquer': 120,
    };

    const maxTime = timeMap[input.prepTimePreference] || 60; // Padrão mais seguro 60

    // 🚨 ATENÇÃO: A função generateRecipe deve aceitar 'ingredients' e 'maxTime'
    const recipes: RecipeResponse = await generateRecipe({
      ingredients: input.mainIngredients,
      restrictions: input.restrictions || '',
      maxTime,
    });

    if (!recipes || recipes.length === 0) {
      // Se o rate limit passou, mas a IA falhou, DEVERÍAMOS desfazer o incremento de uso,
      // mas por simplicidade do MVP, apenas lançamos o erro.
      throw new Error('A IA não conseguiu gerar receitas. Tente novamente.');
    }

    // -------------------------------------------------
    // 4. SALVAR NO FIRESTORE
    // -------------------------------------------------
    // 🚨 CORREÇÃO: Variável 'generatedRecipe' não estava definida. Usamos 'recipes[0]'
    const payload: RecipeBatchPayload = {
      userId: userId, // Agora 'userId' está no escopo e pode ser null
      inputData: input,
      generatedRecipes: recipes, // Salvamos o array completo
      createdAt: Date.now(),
    };
    
    const adminDB = getAdminDB();
    // 🚨 CORREÇÃO: Usa 'adminDB.collection(...).add()' para salvar
    // O ID é gerado pelo Firestore e retornado no docRef.
    const docRef = await adminDB.collection('recipeBatches').add(payload);
    
    // -------------------------------------------------
    // 5. RETORNAR PARA O CLIENTE
    // -------------------------------------------------
    return {
      success: true,
      message: 'Receitas geradas e salvas com sucesso!',
      recipeBatchId: docRef.id, // Retorna o ID para busca posterior
      recipes,
    };

  } catch (err) {
    console.error('Erro na Server Action:', err);

    return {
      success: false,
      message: (err instanceof Error) ? err.message : 'Erro interno ao gerar receita. Verifique logs.',
    };
  }
}