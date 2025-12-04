// src/app/actions.ts
'use server'

import { generateRecipe } from '@/lib/llm'
import { RecipeActionState } from '@/types/recipe'
import { z, ZodError } from 'zod'

// Schema de validação com Zod
const RecipeInputSchema = z.object({
  mainIngredients: z.string().min(3, 'Informe ao menos 3 caracteres para os ingredientes.'),
  restrictions: z.string().default('Nenhuma'),
  prepTimePreference: z.string(),
  cuisinePreference: z.string().default('Qualquer'),
  numberOfRecipes: z.coerce.number().int().min(1).max(5).default(2), // ← AQUI: padrão 2
})

export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  try {
    // 1. VALIDAÇÃO
    let input: z.infer<typeof RecipeInputSchema>
    try {
      input = RecipeInputSchema.parse({
        mainIngredients: formData.get('mainIngredients'),
        restrictions: formData.get('restrictions') || 'Nenhuma',
        prepTimePreference: formData.get('prepTimePreference') || 'Rápido (até 30min)',
        cuisinePreference: formData.get('cuisinePreference') || 'Qualquer',
        numberOfRecipes: formData.get('numberOfRecipes') || 2, // ← permite override futuro
      })
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, message: err.issues[0].message }
      }
      return { success: false, message: 'Erro de validação.' }
    }

    // 2. MAPEAR TEMPO
    const timeMap: Record<string, number> = {
      'SuperRápido(até 15min)': 15,
      'Rápido (até 30min)': 30,
      'Normal (30-60min)': 60,
      'Qualquer': 120,
    }

    const maxTime = timeMap[input.prepTimePreference] || 60

    // 3. CHAMAR A IA (agora com numberOfRecipes correto!)
    const recipes = await generateRecipe({
      ingredients: input.mainIngredients,
      restrictions: input.restrictions,
      maxTime,
      numberOfRecipes: input.numberOfRecipes, // ← agora usa o valor real (2 por padrão)
      cuisinePreference: input.cuisinePreference,
    })

    if (!recipes || recipes.length === 0) {
      throw new Error('A IA não conseguiu gerar receitas.')
    }

    return {
      success: true,
      message: `${recipes.length} receitas geradas com sucesso!`,
      recipes,
    }
  } catch (err) {
    console.error('Erro na Server Action:', err)
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro interno.',
    }
  }
}