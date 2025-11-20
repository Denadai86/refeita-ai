// src/actions/recipe.ts
"use server";

import { z, ZodError } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { generateRecipe } from "@/lib/llm";
import { adminDB } from "@/lib/firebase-admin";
import { RecipeActionState } from "@/types/recipe";

// ---- VALIDATION SCHEMA ----
const RecipeInputSchema = z.object({
  mainIngredients: z.string().min(3, "Informe ao menos 1 ingrediente."),
  restrictions: z.string().default("Nenhuma"),
  prepTimePreference: z.coerce.number().int().min(5).max(180).default(60),
  cuisinePreference: z.string().default("Qualquer"),
  numberOfRecipes: z.coerce.number().int().min(1).max(5).default(3),
});

// ---- MAIN SERVER ACTION ----
export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  // 1. Validação do formulário
  let parsed;
  try {
    parsed = RecipeInputSchema.parse({
      mainIngredients: formData.get("mainIngredients"),
      restrictions: formData.get("restrictions"),
      prepTimePreference: formData.get("prepTimePreference"),
      cuisinePreference: formData.get("cuisinePreference"),
      numberOfRecipes: formData.get("numberOfRecipes"),
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false,
        message: err.issues[0].message,
      };
    }
    return { success: false, message: "Erro inesperado ao validar formulário." };
  }

  // 2. Geração das receitas + salvamento no Firestore
  try {
    const generatedRecipes = await generateRecipe({
      ingredients: parsed.mainIngredients,
      restrictions: parsed.restrictions,
      maxTime: parsed.prepTimePreference,
      numberOfRecipes: parsed.numberOfRecipes,
    });

    const batchRef = await adminDB.collection("recipeBatches").add({
      userId: null, // depois coloca o user autenticado
      inputData: parsed,
      generatedRecipes,
      createdAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Receitas geradas com sucesso!",
      recipeBatchId: batchRef.id,
      recipes: generatedRecipes,
    };
  } catch (error) {
    console.error("Erro na ação de gerar receitas:", error);
    return {
      success: false,
      message: "Falha ao gerar ou salvar as receitas. Tente novamente.",
    };
  }
}