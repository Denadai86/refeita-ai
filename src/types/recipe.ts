// src/types/recipe.ts

// Estrutura de entrada do formulário (FormData)
export type RecipeFormInput = {
  mainIngredients: string; // Ex: 'frango, batata, cenoura'
  restrictions: string; // Ex: 'vegetariano, sem glúten'
  prepTimePreference: 'SuperRápido(até 15min)'|'Rápido (até 30min)' | 'Normal (30-60min)' | 'Qualquer';
  cuisinePreference: string; // Ex: 'italiana, brasileira, asiática'
  numberOfRecipes: number; // Quantas receitas gerar (Ex: 3)
};

// Estrutura esperada do JSON de SAÍDA do Gemini para uma única receita
export type RecipeDetail = {
  recipeName: string;
  description: string;
  prepTime: string; // Ex: "45 minutos"
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[]; // Passos detalhados
  tips: string[]; // Dicas extras
};

// Estrutura final que será salva no Firestore
export type GeneratedRecipe = {
  id: string; // Gerado pelo Firestore
  userId: string | null;
  inputData: RecipeFormInput; // Para referência
  generatedRecipes: RecipeDetail[]; // Array de receitas geradas
  createdAt: firebase.firestore.Timestamp;
};

// Estrutura de retorno da Server Action
export type RecipeActionState = {
  success: boolean;
  message: string;
  recipeBatchId?: string; // ID do documento salvo no Firestore
  recipes?: RecipeDetail[]; // Conteúdo para exibição imediata
};