// src/lib/llm.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RecipeDetail } from '@/types/recipe'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3.0-pro'] as const

interface GenerateRecipeParams {
  ingredients: string
  restrictions: string
  maxTime: number
  numberOfRecipes?: number
  cuisinePreference?: string // ← NOVO: agora vem do formulário!
}

export async function generateRecipe({
  ingredients,
  restrictions,
  maxTime,
  numberOfRecipes = 2,
  cuisinePreference = 'brasileira', // padrão
}: GenerateRecipeParams): Promise<RecipeDetail[]> {
  const cuisineText = cuisinePreference && cuisinePreference !== 'Qualquer' 
    ? `Estilo de culinária: ${cuisinePreference.toLowerCase()} (adapte os sabores, temperos e nomeação para esse estilo)` 
    : 'Estilo de culinária: brasileira (padrão)'

  const prompt = `
Você é um chef de renome mundial apaixonado, com alma de cozinheiro de rua tailandês, italiano, baiano — depende do que o usuário pedir.

Ingredientes que a pessoa TEM em casa (OBRIGATÓRIO usar):
${ingredients}

${restrictions && restrictions !== 'Nenhuma' ? `Restrições: ${restrictions}` : ''}
Tempo máximo: ${maxTime} minutos
Estilo de culinária: ${cuisinePreference === 'Qualquer' ? 'brasileira com liberdade total' : cuisinePreference}

Gere EXATAMENTE ${numberOfRecipes} receitas diferentes.

REGRAS OBRIGATÓRIAS:
- Dê um NOME CRIATIVO, divertido e inesquecível pra cada receita (ex: "Frango Dormiu no Limão e Acordou Tailandês")
- Ingredientes que a pessoa já tem → começar com "✓ "
- Ingredientes extras básicos → começar com "➕ "
- No final de cada receita, adicione uma "dica do chef" curta, emocional e brasileira (ex: "Se tiver uma música tocando enquanto come, melhor ainda.")

Retorne APENAS JSON válido:

[
  {
    "name": "Frango Tailandês que Esqueceu de Ser Triste",
    "ingredients": ["✓ 200g de peito de frango assado", "✓ 2 ovos", "✓ suco de 1 limão rosa", "➕ 1 colher de molho de peixe", "➕ coentro fresco"],
    "instructions": ["Mistura tudo", "Frita o ovo com amor", "Joga por cima"],
    "prepTime": 12,
    "difficulty": "Fácil",
    "calories": 480,
    "servings": "1 alma feliz",
    "tip": "Se apertar mais limão rosa na hora de comer, o limão agradece e você também."
  }
]
`.trim()

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 4000,
          responseMimeType: 'application/json',
        },
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      const cleaned = text.replace(/^```json\s*|```$/g, '').trim()
      const parsed = JSON.parse(cleaned)

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as RecipeDetail[]
      }
    } catch (err) {
      console.warn(`[LLM] Falha com ${modelName}:`, err instanceof Error ? err.message : err)
      continue
    }
  }

  throw new Error('Falha ao gerar receitas com Gemini.')
}