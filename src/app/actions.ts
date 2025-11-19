// src/app/actions.ts
'use server';

import { generateRecipe } from '@/lib/llm';
import { adminDB } from '@/lib/firebase-admin';
import { RecipeActionState, RecipeFormInput, GeneratedRecipeModel } from '@/types/recipe';

// Server Action principal, chamada pelo RecipeForm
export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {

  try {
    // -------------------------------------------------
    // 1. LER INPUTS DO FORMULÁRIO
    // -------------------------------------------------
    const input: RecipeFormInput = {
      mainIngredients: formData.get('mainIngredients')?.toString() || '',
      restrictions: formData.get('restrictions')?.toString() || '',
      prepTimePreference: formData.get('prepTimePreference')?.toString() as any,
      cuisinePreference: formData.get('cuisinePreference')?.toString() || '',
      numberOfRecipes: 1, // MVP fixo por enquanto, pode expandir depois
    };

    if (input.mainIngredients.split(',').length < 2) {
      return {
        success: false,
        message: 'Inclua ao menos 2 ingredientes.',
      };
    }

    // -------------------------------------------------
    // 2. CONVERTER O TEMPO EM MINUTOS
    // -------------------------------------------------
    const timeMap: Record<string, number> = {
      'Super Rápido (até 15min)': 15,
      'Rápido (até 30min)': 30,
      'Normal (30-60min)': 60,
      'Qualquer': 120,
    };

    const maxTime = timeMap[input.prepTimePreference] || 30;

    // -------------------------------------------------
    // 3. CHAMAR O LLM
    // -------------------------------------------------
    const recipes = await generateRecipe({
      ingredients: input.mainIngredients,
      restrictions: input.restrictions || '',
      maxTime,
    });

    if (!recipes || recipes.length === 0) {
      return {
        success: false,
        message: 'A IA não conseguiu gerar receitas. Tente novamente.',
      };
    }

    // -------------------------------------------------
    // 4. SALVAR NO FIRESTORE
    // -------------------------------------------------
    const payload: GeneratedRecipeModel = {
      userId: null, // quando tiver login, mudamos
      inputData: input,
      generatedRecipes: recipes,
      createdAt: Date.now(),
    };

    const docRef = await adminDB.collection('generated_recipes').add(payload);

    // -------------------------------------------------
    // 5. RETORNAR PARA O CLIENTE
    // -------------------------------------------------
    return {
      success: true,
      message: 'Receitas geradas com sucesso!',
      recipeBatchId: docRef.id,
      recipes,
    };

  } catch (err) {
    console.error('Erro na server action:', err);

    return {
      success: false,
      message: 'Erro ao gerar receita. Tente novamente.',
    };
  }
}
