// src/lib/llm.ts (volta pro seu código original + essa pequena mudança)
import { GoogleGenAI } from "@google/genai";  // ← mantém esse
import { RecipeDetail } from "@/types/recipe";
import { generateWithGemini } from "../utils/gemini"; // ajuste o caminho se necessário

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

type GenResponse = any;

const MODEL_FALLBACK = [
  "models/gemini-3-pro-preview",
  "models/gemini-2.5-pro",
  "models/gemini-pro-latest",
  "models/gemini-2.5-flash",
  "models/gemini-flash-latest",
  "models/gemini-2.5-flash-lite"
];

export async function generateRecipe(req: {
  ingredients: string;
  restrictions: string;
  maxTime: number;
  numberOfRecipes?: number;   // ← só adiciona isso (opcional)
}): Promise<RecipeDetail[]> {

  const quantity = req.numberOfRecipes || 3;

  const userPrompt = `
Ingredientes: ${req.ingredients}
Restrições: ${req.restrictions || "Nenhuma"}
Tempo máximo: ${req.maxTime} minutos
Gere exatamente ${quantity} receitas completas.
Retorne APENAS um array JSON válido, sem texto fora.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      config: {
        temperature: 0.8,
        responseMimeType: "application/json",
      }
    });
    // Se a geração falhar ou retornar uma resposta vazia/incompleta
      if (!response.text) { 
          console.error("A resposta da IA está vazia ou incompleta:", response);
          // Lança um erro para ser capturado no bloco try/catch da Server Action
          throw new Error("Falha na geração da receita pela IA: resposta de texto vazia.");
      }
      
    const raw = response.text.trim();
    const cleaned = raw.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/g, "").trim();

    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [parsed];

  } catch (err) {
    console.error("Erro Gemini:", err);
    throw new Error("Falha ao gerar receita");
  }
}

// Exemplo: src/lib/llm.ts (ou o arquivo que usa generateWithGemini)
type GenResponseFallback = any;



export async function generateWithFallback(prompt: string, options?: { temperature?: number; maxOutputTokens?: number; }) {
  const opts = { temperature: 0.2, maxOutputTokens: 1024, ...(options || {}) };
  let lastErr: any = null;

  for (const model of MODEL_FALLBACK) {
    try {
      console.info(`[LLM] Tentando modelo: ${model}`);
      const res: GenResponseFallback = await generateWithGemini({
        model,
        prompt,
        temperature: opts.temperature,
        maxOutputTokens: opts.maxOutputTokens
      });

      // Normalize/resgata texto de várias formas possíveis de resposta
      // Adapte isso conforme a forma que seu wrapper retorna dados
      const text =
        res?.outputText ||
        res?.candidates?.[0]?.content?.[0]?.text ||
        res?.output?.[0]?.content?.[0]?.text ||
        (typeof res === "string" ? res : undefined);

      if (text && text.trim().length > 0) {
        console.info(`[LLM] Modelo ${model} gerou resposta.`);
        return { model, text, raw: res };
      }

      lastErr = new Error(`Resposta vazia do modelo ${model}`);
      console.warn(`[LLM] ${lastErr.message}`);
    } catch (err) {
      lastErr = err;
      console.error(`[LLM] Erro com modelo ${model}:`, (err as any).message ?? err);
      // continua para próximo modelo
    }
  }

  throw new Error(`Todos os modelos falharam. Último erro: ${(lastErr && (lastErr.message || String(lastErr))) || "desconhecido"}`);
}