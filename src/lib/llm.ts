// src/lib/llm.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RecipeDetail } from '@/types/recipe'

// REMOVIDO: Inicialização global do genAI. 
// Isso previne que o servidor caia se a chave não carregar instantaneamente.

// Ordem de tentativa dos modelos para garantir disponibilidade
const MODELS = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'] as const

interface GenerateRecipeParams {
  ingredients: string
  restrictions: string
  maxTime: number
  numberOfRecipes?: number
  cuisinePreference?: string
}

export async function generateRecipe({
  ingredients,
  restrictions,
  maxTime,
  numberOfRecipes = 2,
  cuisinePreference = 'brasileira',
}: GenerateRecipeParams): Promise<RecipeDetail[]> {
  
  // 1. Validação de Segurança da Chave
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GEMINI_API_KEY is missing in environment variables.");
    throw new Error("Configuração de servidor inválida (API Key ausente).");
  }

  // 2. Inicialização segura (Lazy Initialization)
  const genAI = new GoogleGenerativeAI(apiKey);

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
- No final de cada receita, adicione uma "dica do chef" curta, emocional e brasileira.

Retorne APENAS JSON válido, sem markdown code blocks:
[
  {
    "name": "Frango Tailandês que Esqueceu de Ser Triste",
    "ingredients": ["✓ 200g de frango", "➕ coentro"],
    "instructions": ["Passo 1", "Passo 2"],
    "prepTime": 12,
    "difficulty": "Fácil",
    "calories": 480,
    "servings": "1 pessoa",
    "tip": "Dica extra aqui."
  }
]
`.trim()

  // 3. Estratégia de Fallback de Modelos
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.85, // Criatividade alta para nomes divertidos
          maxOutputTokens: 4000,
          responseMimeType: 'application/json',
        },
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()

      // Limpeza de segurança caso a IA retorne Markdown (ex: ```json ... ```)
      const cleaned = text.replace(/^```json\s*|```$/g, '').trim()
      const parsed = JSON.parse(cleaned)

      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as RecipeDetail[]
      }
    } catch (err) {
      console.warn(`[LLM] Falha silenciosa com ${modelName}:`, err instanceof Error ? err.message : err)
      // Continua para o próximo modelo no loop
      continue
    }
  }

  // Se todos falharem
  throw new Error('O Chef está sobrecarregado. Tente novamente em alguns segundos.')
}