import { RecipeDetail } from "@/types/recipe";
// Certifique-se de que o arquivo gemini.ts está em src/lib/gemini.ts
// Se estiver em utils, ajuste para "@/utils/gemini"
import { generateWithGemini } from "@/utils/gemini"; 

type GenResponse = any;

// Lista de modelos para fallback em caso de sobrecarga ou erro
const MODEL_FALLBACK = [
  "gemini-2.5-flash",      // Versão estável e rápida atual
  "gemini-2.5-pro",        // Versão mais inteligente
];

export async function generateRecipe(req: {
  ingredients: string;
  restrictions: string;
  maxTime: number;
  numberOfRecipes?: number;
}): Promise<RecipeDetail[]> {
  const quantity = req.numberOfRecipes || 3;

  const userPrompt = `
  Atue como um chef experiente.
  Ingredientes disponíveis: ${req.ingredients}
  Restrições alimentares: ${req.restrictions || "Nenhuma"}
  Tempo máximo de preparo: ${req.maxTime} minutos
  
  Gere exatamente ${quantity} receitas criativas e viáveis usando PRINCIPALMENTE os ingredientes disponíveis (pode adicionar básicos de despensa como sal, azeite, água, temperos).
  
  Retorne APENAS um array JSON válido seguindo estritamente esta estrutura, sem markdown ou texto adicional:
  [
    {
      "name": "Nome da Receita",
      "ingredients": ["ingrediente 1", "ingrediente 2"],
      "instructions": ["passo 1", "passo 2"],
      "prepTime": 30,
      "calories": 500 (estimado, número apenas),
      "difficulty": "Fácil" | "Médio" | "Difícil"
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
        temperature: 0.7, // Um pouco de criatividade, mas controlado
        maxOutputTokens: 4000
      });

      // Normalização da resposta (extrair texto de diferentes formatos de resposta do SDK)
      const rawText =
        res?.output?.[0]?.content?.map((c: any) => c?.text).filter(Boolean).join("") || // Novo SDK
        res?.candidates?.[0]?.content?.[0]?.text || // Outra estrutura comum
        res?.outputText || // SDK Legado
        res?.text || // Simplificado
        (typeof res === "string" ? res : undefined);

      if (!rawText || String(rawText).trim().length === 0) {
        throw new Error(`Resposta vazia do modelo ${model}`);
      }

      // Limpeza severa para garantir JSON válido (remove ```json ... ```)
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
        console.warn(`[LLM] Falha ao parsear JSON do modelo ${model}. Texto recebido: ${cleaned.substring(0, 50)}...`);
        // Não lança erro imediatamente, deixa o loop tentar o próximo modelo
        lastErr = parseErr;
        continue;
      }

    } catch (err) {
      lastErr = err;
      console.error(`[LLM] Erro com modelo ${model}:`, (err instanceof Error) ? err.message : err);
      // Continua para o próximo modelo
    }
  }

  throw new Error(`Falha na geração de receitas após tentar todos os modelos. Último erro: ${lastErr?.message || "Desconhecido"}`);
}

/**
 * Função utilitária para gerações de texto genéricas (ex: chat, dicas)
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
        res?.output?.[0]?.content?.map((c: any) => c?.text).filter(Boolean).join("") ||
        res?.candidates?.[0]?.content?.[0]?.text ||
        res?.outputText ||
        res?.text ||
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