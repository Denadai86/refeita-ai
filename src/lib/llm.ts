// src/lib/llm.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { RecipeDetail } from '@/types/recipe'

// 🟢 Usando nomes de modelos estáveis e atuais para evitar Erros 404
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash-preview', 'gemini-3-pro-preview'] as const

interface GenerateRecipeParams {
  ingredients: string
  restrictions: string
  maxTime: number
  numberOfRecipes?: number
  cuisinePreference?: string
}

/**
 * GERAÇÃO DE RECEITAS (Texto -> Objeto)
 * Focada em transformar a string de ingredientes em receitas estruturadas.
 */
export async function generateRecipe({
  ingredients,
  restrictions,
  maxTime,
  numberOfRecipes = 2,
  cuisinePreference = 'brasileira',
}: GenerateRecipeParams): Promise<RecipeDetail[]> {
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Configuração GEMINI_API_KEY não encontrada.");

  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
Você é um chef de renome mundial especializado em cozinha criativa e desperdício zero.
Ingredientes disponíveis: ${ingredients}
Restrições alimentares: ${restrictions}
Tempo máximo de preparo: ${maxTime} minutos
Estilo gastronômico: ${cuisinePreference}

Gere EXATAMENTE ${numberOfRecipes} receitas diferentes.
REGRAS:
- Use nomes divertidos e criativos.
- Inclua uma "dica do chef" emocional ao final.

Retorne APENAS um array JSON válido:
[{ "name": "Nome", "ingredients": ["✓ item"], "instructions": ["passo"], "prepTime": 10, "difficulty": "Fácil", "tip": "dica" }]
`.trim()

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 2048,
          responseMimeType: 'application/json',
        },
      })

      const result = await model.generateContent(prompt)
      const text = result.response.text()
      
      // Limpeza robusta de blocos de código markdown
      const cleaned = text.replace(/^```json\s*|```$/g, '').trim()
      const parsed = JSON.parse(cleaned)

      if (Array.isArray(parsed)) return parsed as RecipeDetail[]
    } catch (err) {
      console.warn(`[LLM-Generator] Falha com modelo ${modelName}. Tentando próximo...`);
      continue;
    }
  }
  throw new Error('O Chef IA está temporariamente ocupado. Tente novamente em alguns segundos.');
}

/**
 * DETECÇÃO DE INGREDIENTES (Imagem -> Texto)
 * Utiliza capacidades multimodais para ler fotos de geladeiras e despensas.
 */
export async function detectIngredientsFromImages(base64Images: string[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Configuração GEMINI_API_KEY não encontrada.");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Flash é ideal para visão devido à velocidade e custo
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Analise cuidadosamente as imagens anexadas de uma geladeira ou armário.
Sua tarefa é listar APENAS os ingredientes comestíveis que você consegue identificar.
Retorne apenas os nomes dos itens separados por vírgula.
Se não identificar nenhum alimento, responda exatamente: "Nenhum ingrediente detectado".
`.trim();

  // Mapeia imagens para o formato inlineData aceito pela API do Google
  const imageParts = base64Images.map(base64 => ({
    inlineData: {
      data: base64,
      mimeType: "image/jpeg" // Assegure-se que o frontend envia JPEG ou ajuste dinamicamente
    }
  }));

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Erro na detecção visual Gemini:", error);
    throw new Error("O Chef não conseguiu analisar as fotos. Verifique a iluminação e tente novamente.");
  }
}