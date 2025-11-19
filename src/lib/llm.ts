// src/lib/llm.ts
import { GoogleGenAI } from "@google/genai";
import { RecipeDetail } from "@/types/recipe";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// SYSTEM PROMPT correto para a versão nova
const SYSTEM_PROMPT = `
Você é um Chef especialista da Refeita.AI.
Retorne APENAS um ARRAY JSON contendo receitas válidas.
Não adicione texto fora do JSON.
`;

export async function generateRecipe(req: {
  ingredients: string;
  restrictions: string;
  maxTime: number;
}): Promise<RecipeDetail[]> {

  const userPrompt = `
Ingredientes: ${req.ingredients}
Restrições: ${req.restrictions || "Nenhuma"}
Tempo máximo: ${req.maxTime} minutos
Gere receitas completas seguindo o schema exigido.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",

      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n" + userPrompt }] }
      ],

      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    });

    const raw = response.text.trim();

    const cleaned = raw
      .replace(/^```json/i, "")
      .replace(/^```/i, "")
      .replace(/```$/, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (err) {
    console.error("Erro ao gerar receita (Gemini):", err);
    throw new Error("Falha ao gerar a receita. Tente novamente.");
  }
}
