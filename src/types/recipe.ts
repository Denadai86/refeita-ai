// src/types/recipe.ts
// ===============================================
// 1. INPUTS DO FORMULÁRIO (Simplificado)
// ===============================================

export type PrepTimeOption =
  | "SuperRápido(até 15min)"
  | "Rápido (até 30min)"
  | "Normal (30-60min)"
  | "Qualquer";

/** Dados enviados pelo formulário para a Server Action. */
export type RecipeInput = {
  mainIngredients: string;
  restrictions?: string;
  prepTimePreference: PrepTimeOption;
  cuisinePreference: string;
  numberOfRecipes: number;
};

// ===============================================
// 2. DETALHES DA RECEITA (Saída do LLM)
// ===============================================

export type IngredientItem = {
  name: string;
  quantity: string;
};

/** Estrutura detalhada de uma receita gerada. */
export type RecipeDetail = {
  name: string;
  recipeName: string;
  description: string;
  prepTime: number; // minutos
  servings: number;
  ingredients: IngredientItem[];
  instructions: string[];
  tips: string[];
  difficulty: 'Fácil' | 'Médio' | 'Difícil';
  calories: number;
};

/** Tipo de retorno do llm.ts (sempre um array de receitas) */
export type RecipeResponse = RecipeDetail[];

// ===============================================
// 3. FIRESTORE — MODELOS DE PERSISTÊNCIA
// ===============================================

/** * Representa um LOTE completo de receitas salvo no Firestore.
 * Inclui metadados e o ID do documento.
 */
export type RecipeBatch = {
  id: string; // ID do Documento (gerado pelo Firestore)
  userId: string | null;
  inputData: RecipeInput;
  generatedRecipes: RecipeDetail[];
  createdAt: number; // Timestamp (ms)
};

/** * Payload usado para CRIAR um novo documento no Firestore.
 * É o RecipeBatch, mas sem o ID (que é gerado pelo DB).
 */
export type RecipeBatchPayload = Omit<RecipeBatch, 'id'>;


// ===============================================
// 4. RETORNO DA SERVER ACTION (Estado)
// ===============================================

/** Estado de retorno para o hook useFormState. */
export type RecipeActionState = {
  success: boolean;
  message: string;
  recipeBatchId?: string; // ID do lote recém-criado (RecipeBatch)
  recipes?: RecipeDetail[]; // Receitas geradas para exibição
  errorDetails?: { field: string; message: string }[];
};