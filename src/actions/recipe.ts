// src/actions/recipe.ts
"use server";

import { generateRecipe, detectIngredientsFromImages } from "@/lib/llm";
import {
  RecipeInputSchema,
  RecipeActionState,
  RecipeDetail,
  LLMInput
} from "@/types/recipe";

// ============================================================================
// 1. HELPERS
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
// 2. SERVER ACTION (Geração de Receita via Texto)
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
        field: field,
        message: Array.isArray(messages) ? messages[0] : (messages ?? "Erro inválido"),
      })),
    };
  }

  const validated: LLMInput = result.data;

  // B. Preparação do Payload para LLM
  const llmPayload = {
    ingredients: validated.mainIngredients,
    restrictions: validated.restrictions ?? "Nenhuma",
    maxTime: getMaxTime(validated.prepTimePreference),
    cuisinePreference: validated.cuisinePreference ?? "Qualquer",
    numberOfRecipes: validated.numberOfRecipes,
  };

  try {
    // C. Chamada ao Gemini
    const generatedRecipes: RecipeDetail[] = await generateRecipe(llmPayload);

    if (!generatedRecipes || generatedRecipes.length === 0) {
      return {
        success: false,
        message: "O Chef IA não conseguiu criar nada com esses ingredientes. Tente outros!",
      };
    }

    // E. Retorno de Sucesso para o Client (O Firestore salva no RecipeGenerator.tsx)
    return {
      success: true,
      message: "Receitas criadas com sucesso!",
      recipes: generatedRecipes,
    };

  } catch (error) {
    console.error("❌ Erro Crítico na Action:", error);
    return {
      success: false,
      message: "Erro ao conectar com a IA. Tente novamente em instantes.",
    };
  }
}

// ============================================================================
// 3. SERVER ACTION (Identificação de Ingredientes via Foto)
// ============================================================================

export async function identifyIngredientsAction(base64Images: string[]) {
  try {
    if (!base64Images || base64Images.length === 0) {
      return { success: false, error: "Nenhuma imagem recebida." };
    }

    // Chama a função de visão que criamos no lib/llm.ts
    const ingredients = await detectIngredientsFromImages(base64Images);

    return {
      success: true,
      ingredients: ingredients,
    };
  } catch (error: any) {
    console.error("Erro na identifyIngredientsAction:", error);
    return {
      success: false,
      error: error.message || "Erro ao processar as imagens.",
    };
  }
}