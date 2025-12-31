// src/types/recipe.ts

import { z } from "zod";

// ===============================================
// 1. OPÇÕES FIXAS (Mantido)
// ===============================================
const PrepTimeOptions = [
  "SuperRápido(até 15min)",
  "Rápido (até 30min)",
  "Normal (30-60min)",
  "Qualquer",
] as const;

export type PrepTimeOption = typeof PrepTimeOptions[number];

// ===============================================
// 2. SCHEMA ZOD + TIPOS DE ENTRADA (Mantido)
// ===============================================
export const RecipeInputSchema = z.object({
  mainIngredients: z
    .string()
    .min(3, "Põe pelo menos alguns ingredientes pra eu trabalhar, vai...")
    .max(500, "Máximo 500 caracteres nos ingredientes"),

  restrictions: z.string().optional(),

  prepTimePreference: z.enum(PrepTimeOptions, {
    message: "Escolhe uma opção válida de tempo",
  }),

  cuisinePreference: z
    .string()
    .optional()
    .default("Qualquer")
    .transform((val) => (val === "" ? "Qualquer" : val)),

  numberOfRecipes: z.coerce
    .number()
    .int()
    .min(1, "Mínimo 1 receita")
    .max(5, "Máximo 5 receitas por vez (token é caro irmão)"),
});

export type LLMInput = z.infer<typeof RecipeInputSchema>;
export type RecipeInput = LLMInput;

// ===============================================
// 3. DETALHES DA RECEITA GERADA (CORRIGIDO PARA O JSON DA LLM)
// ===============================================

// 🛑 REMOVEMOS IngredientItem porque a LLM retorna STRING[]
// export type IngredientItem = { ... };

/**
 * Representa uma única receita gerada pela LLM,
 * alinhada EXATAMENTE com a saída do prompt.
 */
export interface RecipeDetail {
  id?: string; // Adicionado ID
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // ou string, dependendo do seu form
  difficulty: string;
  calories: string;
  tip: string;
  servings?: string;
  likes?: number; // Adicionado Likes
}

// Mantido como array
export type RecipeResponse = RecipeDetail[];

// ===============================================
// 4. FIRESTORE (Ajustado para o novo RecipeDetail)
// ===============================================

export type RecipeBatch = {
  id: string;
  userId: string | null;
  inputData: LLMInput;
  generatedRecipes: RecipeDetail[]; // Agora usa o tipo corrigido
  createdAt: number;
};

export type RecipeBatchPayload = Omit<RecipeBatch, "id">;

// ===============================================
// 5. RETORNO DA SERVER ACTION (Mantido)
// ===============================================

export type RecipeActionState = {
  success: boolean;
  message: string;
  recipeBatchId?: string;
  recipes?: RecipeDetail[];
  errorDetails?: { field: string; message: string }[];
};