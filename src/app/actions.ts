// src/app/actions.ts
'use server'

import { getServerSession } from 'next-auth'
import { auth as authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateRecipe } from '@/lib/llm'
import { RecipeActionState, RecipeInput, RecipeBatchPayload, RecipeResponse } from '@/types/recipe'
import { z, ZodError } from 'zod'

// Schema de validação com Zod
const RecipeInputSchema = z.object({
  mainIngredients: z.string().min(3, 'Informe ao menos 3 caracteres para os ingredientes.'),
  restrictions: z.string().default('Nenhuma'),
  prepTimePreference: z.string(),
  cuisinePreference: z.string().default('Qualquer'),
  numberOfRecipes: z.number().int().min(1).max(5).default(1),
})

/**
 * Server Action principal – versão MVP SEM limite de uso e SEM Firebase Admin
 * Tudo que estava quebrando foi comentado/desativado temporariamente.
 */
export async function generateRecipeAction(
  prevState: RecipeActionState,
  formData: FormData
): Promise<RecipeActionState> {
  const session = await getServerSession(authOptions as any)

  // Usuário logado ou anônimo (só pra identificar)
  const userId = (session as any)?.user?.id || `anon-${Date.now()}`
  const userPlan = (session as any)?.user?.plan || 'FREE'

  try {
    // 1. VALIDAÇÃO DOS DADOS DO FORMULÁRIO
    let input: z.infer<typeof RecipeInputSchema>
    try {
      input = RecipeInputSchema.parse({
        mainIngredients: formData.get('mainIngredients'),
        restrictions: formData.get('restrictions') || 'Nenhuma',
        prepTimePreference: formData.get('prepTimePreference'),
        cuisinePreference: formData.get('cuisinePreference') || 'Qualquer',
        numberOfRecipes: 1, // MVP: sempre gera 1 receita por enquanto
      })
    } catch (err) {
      if (err instanceof ZodError) {
        return { success: false, message: err.issues[0].message }
      }
      return { success: false, message: 'Erro de validação do formulário.' }
    }

    // 2. RATE LIMIT DESATIVADO TEMPORARIAMENTE (era o que estava quebrando tudo)
    // if (userPlan === 'FREE') {
    //   const allowed = await checkAndIncrementUsage(userId)
    //   if (!allowed) {
    //     return { success: false, message: `Limite de receitas gratuitas atingido.` }
    //   }
    // }

    // 3. MAPEAR TEMPO E CHAMAR A IA (Gemini via /api/gemini)
    const timeMap: Record<string, number> = {
      'SuperRápido(até 15min)': 15,
      'Rápido (até 30min)': 30,
      'Normal (30-60min)': 60,
      'Qualquer': 120,
    }

    const maxTime = timeMap[input.prepTimePreference] || 60

    const recipes: RecipeResponse = await generateRecipe({
      ingredients: input.mainIngredients,
      restrictions: input.restrictions || '',
      maxTime,
      numberOfRecipes: input.numberOfRecipes,
    })

    if (!recipes || recipes.length === 0) {
      throw new Error('A IA não conseguiu gerar receitas. Tente novamente.')
    }

    // 4. SALVAR NO FIRESTORE COM ADMIN SDK TAMBÉM DESATIVADO (não quebra mais)
    // const adminDB = getAdminDb()
    // if (!adminDB) throw new Error('Banco de dados indisponível.')
    // const payload: RecipeBatchPayload = { ... }
    // await adminDB.collection('recipeBatches').add(payload)

    // 5. RETORNO DE SUCESSO (sem salvar no banco por enquanto)
    return {
      success: true,
      message: 'Receita gerada com sucesso!',
      recipes,
      // recipeBatchId: docRef?.id,
    }
  } catch (err) {
    console.error('Erro na Server Action:', err)
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro interno. Tente novamente.',
    }
  }
}