// src/lib/llm.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RecipeDetail } from '@/types/recipe'

// ============================================================================
// CONFIGURAÇÃO E CONSTANTES
// ============================================================================

// Modelos definidos manualmente pelo João (Dez/2025)
const TEXT_MODELS = [
  'gemini-2.5-flash',       // Mais rápido e estável atual
  'gemini-2.5-pro',         // Fallback ultra estável
  'gemini-3-flash-preview', // Fallback de alta qualidade
] as const

const VISION_MODELS = [
  'gemini-2.5-flash',       // Mais rápido e estável atual
  'gemini-2.5-pro',         // Fallback ultra estável
  'gemini-3-flash-preview', // Fallback de alta qualidade
] as const

// Mensagem exata de erro para controle no frontend
export const NO_INGREDIENTS_MSG = "* * *Nenhum ingrediente identificado* * *";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// TYPES & HELPERS
// ============================================================================

interface GenerateRecipeParams {
  ingredients: string
  restrictions: string
  maxTime: number
  numberOfRecipes?: number
  cuisinePreference?: string
}

function cleanAndParseJSON<T>(text: string): T {
  const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
  try {
    return JSON.parse(cleanText) as T;
  } catch {
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as T;
      } catch (e) {
        throw new Error("Falha ao corrigir estrutura do JSON da IA");
      }
    }
    throw new Error("Nenhum JSON válido detectado na resposta.");
  }
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("CRÍTICO: GEMINI_API_KEY não configurada.");
  return new GoogleGenerativeAI(apiKey);
}

// ============================================================================
// CORE: GERAÇÃO DE RECEITAS
// ============================================================================

export async function generateRecipe({
  ingredients,
  restrictions,
  maxTime,
  numberOfRecipes = 2,
  cuisinePreference = 'brasileira',
}: GenerateRecipeParams): Promise<RecipeDetail[]> {
  
  const genAI = getGenAI();

  const prompt = `
Você é um chef criativo e sustentável.
Contexto:
- Ingredientes: ${ingredients}
- Restrições: ${restrictions}
- Tempo Max: ${maxTime} min
- Estilo: ${cuisinePreference}

Tarefa: Crie ${numberOfRecipes} receitas.
Saída OBRIGATÓRIA: Array JSON puro, sem markdown.
Schema:
[{
  "name": "Nome Criativo",
  "ingredients": ["item 1", "item 2"],
  "instructions": ["passo 1", "passo 2"],
  "prepTime": 30,
  "difficulty": "Fácil",
  "calories": "aprox 500kcal",
  "tip": "Dica emocional do chef"
}]
`.trim();

  let lastError: any;

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const modelName = TEXT_MODELS[i];
    try {
      console.log(`[LLM] Tentando modelo: ${modelName} (tentativa ${i + 1})`);
      
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.5,
          responseMimeType: 'application/json',
        },
      });

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000))
      ]) as any;

      const text = result.response.text();
      const recipes = cleanAndParseJSON<RecipeDetail[]>(text);

      if (!Array.isArray(recipes) || recipes.length === 0) {
        throw new Error("IA retornou formato inválido (não é array)");
      }

      return recipes;

    } catch (err: any) {
      console.warn(`[LLM] Falha no modelo ${modelName}:`, err.message);
      lastError = err;
      if (err.message?.includes('429') || err.message?.includes('503')) {
        await wait(1500 * (i + 1));
      }
    }
  }

  throw new Error(`O Chef está indisponível no momento. (${lastError?.message || 'Erro desconhecido'})`);
}

// ============================================================================
// CORE: DETECÇÃO DE INGREDIENTES
// ============================================================================

export async function detectIngredientsFromImages(base64Images: string[]): Promise<string> {
  const genAI = getGenAI();

  const prompt = `
Analise estas imagens de alimentos (geladeira/despensa).
Liste APENAS os ingredientes comestíveis visíveis, separados por vírgula.
Ignore embalagens não alimentícias, prateleiras ou sujeira.
Exemplo: "Ovos, Leite, Tomate, Cenoura"
Se não houver comida visível, responda EXATAMENTE: "${NO_INGREDIENTS_MSG}".
`.trim();

  const imageParts = base64Images.map(base64 => ({
    inlineData: { data: base64, mimeType: "image/jpeg" }
  }));

  for (const modelName of VISION_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([prompt, ...imageParts]);
      const text = result.response.text().trim();
      
      if (!text) throw new Error("Resposta vazia da IA");
      return text;

    } catch (err: any) {
      console.warn(`[Vision] Falha no modelo ${modelName}:`, err.message);
      // Continua para o próximo sem delay longo
    }
  }

  throw new Error("Não foi possível analisar as imagens. Tente tirar fotos mais claras.");
}