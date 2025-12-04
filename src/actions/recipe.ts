// src/actions/recipe.ts
"use server";

import { generateRecipe } from "@/lib/llm";
import {
  RecipeInputSchema,
  RecipeActionState,
  RecipeDetail,
  RecipeBatch,
  LLMInput
} from "@/types/recipe";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from 'uuid'; // Instale: npm i uuid @types/uuid

// ============================================================================
// 1. MOCK DATABASE (Banco em Memória)
// ============================================================================
/**
 * ⚠️ NOTA DE ENGENHARIA:
 * Como não temos um banco de dados real configurado ainda (Postgres/Prisma ou Firebase),
 * estamos usando um Map global para armazenar as receitas em memória enquanto o servidor roda.
 * * Em produção, isso DEVE ser substituído por chamadas reais ao banco.
 * Se o servidor reiniciar, esses dados somem.
 */
const RECIPE_STORE = new Map<string, RecipeBatch>();

// ============================================================================
// 2. HELPERS
// ============================================================================

function getMaxTime(prepTime: string): number {
  switch (prepTime) {
    case "SuperRápido(até 15min)": return 15;
    case "Rápido (até 30min)": return 30;
    case "Normal (30-60min)": return 60;
    case "Qualquer":
    default: return 120;
  }
}

// ============================================================================
// 3. SERVER ACTION (Geração)
// ============================================================================

export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  
  // A. Validação com Zod
  const rawData = {
    mainIngredients: formData.get("mainIngredients"),
    restrictions: formData.get("restrictions") || undefined,
    prepTimePreference: formData.get("prepTimePreference"),
    cuisinePreference: formData.get("cuisinePreference"),
    numberOfRecipes: formData.get("numberOfRecipes"),
  };

  const result = RecipeInputSchema.safeParse(rawData);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return {
      success: false,
      message: "Ops! Faltou preencher algo corretamente.",
      errorDetails: Object.entries(fieldErrors).map(([field, messages]) => ({
        field,
        message: Array.isArray(messages) ? messages[0] : (messages ?? "Erro inválido"),
      })),
    };
  }

  const validated: LLMInput = result.data;

  // B. Preparação do Payload para LLM
  // Note que agora incluímos cuisinePreference explicitamente
  const llmPayload = {
    ingredients: validated.mainIngredients,
    restrictions: validated.restrictions ?? "Nenhuma",
    maxTime: getMaxTime(validated.prepTimePreference),
    cuisinePreference: validated.cuisinePreference ?? "Qualquer",
    numberOfRecipes: validated.numberOfRecipes,
  };

  try {
    // C. Chamada à Inteligência (Gemini)
    const generatedRecipes: RecipeDetail[] = await generateRecipe(llmPayload);

    if (!generatedRecipes || generatedRecipes.length === 0) {
      return {
        success: false,
        message: "O Chef IA travou e não conseguiu criar nada com esses ingredientes. Tente simplificar.",
      };
    }

    // D. Persistência (Salvar no Mock DB)
    const batchId = uuidv4(); // Gera um ID único
    const newBatch: RecipeBatch = {
      id: batchId,
      userId: "guest-user", // Futuramente pegar da sessão
      inputData: validated,
      generatedRecipes: generatedRecipes,
      createdAt: Date.now(),
    };

    // Salvando na memória
    RECIPE_STORE.set(batchId, newBatch);

    // E. Retorno de Sucesso
    // Retornamos o ID para que o componente Client possa fazer o redirect
    return {
      success: true,
      message: "Receitas criadas com sucesso! Redirecionando...",
      recipeBatchId: batchId,
      recipes: generatedRecipes,
    };

  } catch (error) {
    console.error("❌ Erro Crítico na Action:", error);
    return {
      success: false,
      message: "Erro interno no servidor de IA. Tente novamente em instantes.",
    };
  }
}

// ============================================================================
// 4. SERVER FUNCTION (Leitura para a Página [id])
// ============================================================================

/**
 * Busca o lote de receitas pelo ID.
 * Usada pelo Server Component em src/app/[id]/page.tsx
 */
export async function getRecipeBatchById(id: string): Promise<RecipeBatch | null> {
  // Simula um delay de banco de dados para ver o loading state (opcional)
  // await new Promise(resolve => setTimeout(resolve, 500));
  
  const batch = RECIPE_STORE.get(id);

  if (!batch) {
    console.warn(`⚠️ Batch ${id} não encontrado no store em memória.`);
    return null;
  }

  return batch;
}