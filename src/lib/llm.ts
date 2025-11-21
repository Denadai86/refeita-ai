// src/lib/llm.ts

import { RecipeDetail } from "@/types/recipe";
// Certifique-se de que o arquivo gemini.ts está no caminho correto
import { generateWithGemini } from "@/utils/gemini"; 

type GenResponse = any;

// Lista de modelos oficiais (ajustado para versões existentes e estáveis)
const MODEL_FALLBACK = [

  "gemini-2.5-pro",        // Maior raciocínio
  
];

export async function generateRecipe(req: {
  ingredients: string;
  restrictions: string;
  maxTime: number;
  numberOfRecipes?: number;
}): Promise<RecipeDetail[]> {
  const quantity = req.numberOfRecipes || 3;

  // Prompt otimizado para garantir formato de string nos ingredientes
  const userPrompt = `
  Atue como um chef experiente.
  Ingredientes disponíveis: ${req.ingredients}
  Restrições alimentares: ${req.restrictions || "Nenhuma"}
  Tempo máximo de preparo: ${req.maxTime} minutos
  
  Gere exatamente ${quantity} receitas criativas e viáveis usando PRINCIPALMENTE os ingredientes disponíveis.
  
  IMPORTANTE SOBRE OS INGREDIENTES:
  Retorne a lista de ingredientes como strings simples que já contenham a quantidade e o nome.
  Exemplo Correto: ["200g de Frango", "1 colher de azeite", "Sal a gosto"]
  
  Retorne APENAS um array JSON válido seguindo estritamente esta estrutura (sem markdown):
  [
    {
      "name": "Nome da Receita",
      "ingredients": [
        "quantidade + ingrediente 1", 
        "quantidade + ingrediente 2"
      ],
      "instructions": ["passo 1", "passo 2"],
      "prepTime": 30,
      "servings": "2 pessoas",
      "calories": 500,
      "difficulty": "Fácil"
    }
  ]
  `;

  let lastErr: any = null;

  // Tenta os modelos em ordem (Fallback Strategy)
  for (const model of MODEL_FALLBACK) {
    try {
      const res: GenResponse = await generateWithGemini({
        model,
        prompt: userPrompt,
        temperature: 0.7,
        maxOutputTokens: 4000
      });

      // Normalização da resposta
      const rawText =
        res?.text || 
        res?.output?.[0]?.content?.map((c: any) => c?.text).filter(Boolean).join("") ||
        res?.candidates?.[0]?.content?.[0]?.text ||
        (typeof res === "string" ? res : undefined);

      if (!rawText || String(rawText).trim().length === 0) {
        throw new Error(`Resposta vazia do modelo ${model}`);
      }

      // Limpeza severa para garantir JSON válido
      const cleaned = String(rawText)
        .replace(/^```json\s*/i, "")
        .replace(/^```/i, "")
        .replace(/```$/g, "")
        .trim();

      try {
        const parsed = JSON.parse(cleaned);
        // Garante que é um array
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch (parseErr) {
        console.warn(`[LLM] Falha ao parsear JSON do modelo ${model}.`);
        lastErr = parseErr;
        continue;
      }

    } catch (err) {
      lastErr = err;
      console.error(`[LLM] Erro com modelo ${model}:`, (err instanceof Error) ? err.message : err);
    }
  }

  throw new Error(`Falha na geração de receitas após tentar todos os modelos. Último erro: ${lastErr?.message || "Desconhecido"}`);
}

/**
 * Função utilitária para gerações de texto genéricas
 */
export async function generateWithFallback(prompt: string, options?: { temperature?: number; maxOutputTokens?: number; }) {
  const opts = { temperature: 0.5, maxOutputTokens: 1024, ...(options || {}) };
  let lastErr: any = null;

  for (const model of MODEL_FALLBACK) {
    try {
      const res: GenResponse = await generateWithGemini({
        model,
        prompt,
        temperature: opts.temperature,
        maxOutputTokens: opts.maxOutputTokens
      });

      const text =
        res?.text ||
        res?.output?.[0]?.content?.map((c: any) => c?.text).filter(Boolean).join("") ||
        res?.candidates?.[0]?.content?.[0]?.text ||
        (typeof res === "string" ? res : undefined);

      if (text && String(text).trim().length > 0) {
        return { model, text, raw: res };
      }

    } catch (err) {
      lastErr = err;
      console.warn(`[LLM] Erro (Fallback) com modelo ${model}:`, (err as any).message);
    }
  }

  throw new Error(`Todos os modelos falharam. Último erro: ${(lastErr && (lastErr.message || String(lastErr))) || "desconhecido"}`);
}