// src/types/recipe.ts

// ===============================================
// 1. INPUTS DO FORMULÁRIO
// ===============================================

export type PrepTimeOption =
  | "SuperRápido(até 15min)"
  | "Rápido (até 30min)"
  | "Normal (30-60min)"
  | "Qualquer";

export type RecipeFormInput = {
  mainIngredients: string;
  restrictions?: string;
  prepTimePreference: PrepTimeOption;
  cuisinePreference: string;
  numberOfRecipes: number;
};

// ===============================================
// 2. SAÍDA DO LLM (sempre ARRAY)
// ===============================================

export type IngredientItem = {
  name: string;
  quantity: string;
};

export type RecipeDetail = {
  recipeName: string;
  description: string;
  prepTime: number; // minutos
  servings: number;
  ingredients: IngredientItem[];
  instructions: string[];
  tips: string[];
};

// Tipo de retorno do llm.ts
export type RecipeResponse = RecipeDetail[];

// ===============================================
// 3. FIRESTORE — Modelo salvo
// ===============================================

export type GeneratedRecipeModel = {
  userId: string | null;
  inputData: RecipeFormInput;
  generatedRecipes: RecipeDetail[];
  createdAt: number; // timestamp (ms)
};

// ===============================================
// 4. RETORNO DA SERVER ACTION
// ===============================================

export type RecipeActionState = {
  success: boolean;
  message: string;
  recipeBatchId?: string;
  recipes?: RecipeDetail[];
  errorDetails?: { field: string; message: string }[];
};
