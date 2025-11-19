// app/actions/recipe.ts
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
  prepTimePreference: z.string().default("Qualquer"),
  cuisinePreference: z.string().default("Qualquer"),
  numberOfRecipes: z.coerce.number().min(1).max(5).default(2)
});

// ---- MAIN SERVER ACTION ----

export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  let parsed;

  try {
    parsed = RecipeInputSchema.parse({
      mainIngredients: formData.get("mainIngredients"),
      restrictions: formData.get("restrictions"),
      prepTimePreference: formData.get("prepTimePreference"),
      cuisinePreference: formData.get("cuisinePreference"),
      numberOfRecipes: formData.get("numberOfRecipes")
    });
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        success: false,
        message: err.errors[0].message
      };
    }
    return { success: false, message: "Erro inesperado ao validar formulário." };
  }

  // ---- LLM REQUEST ----

  try {
    const recipes = await generateRecipe({
      ingredients: parsed.mainIngredients,
      restrictions: parsed.restrictions,
      maxTime: parsed.prepTimePreference,
      numberOfRecipes: parsed.numberOfRecipes
    });

    // ---- SAVE TO FIRESTORE ----
    const docRef = await adminDB.collection("recipeBatches").add({
      userId: null,
      inputData: parsed,
      generatedRecipes: recipes,
      createdAt: Date.now()
    });

    return {
      success: true,
      message: "Receitas geradas com sucesso.",
      recipeBatchId: docRef.id,
      recipes
    };
  } catch (error) {
    console.error("ERRO ACTION:", error);
    return {
      success: false,
      message: "Falha ao gerar receitas. Tente novamente."
    };
  }
}
