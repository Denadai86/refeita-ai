import "server-only";
import { GoogleGenerativeAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  throw new Error("❌ API Key do Gemini não encontrada.");
}

let cachedModel: any = null;

const SYSTEM_INSTRUCTION = `
Você é um chef de cozinha criativo da plataforma Refeita.AI.

Suas respostas DEVEM ser estritamente um JSON válido, SEM BLOCO DE CÓDIGO,
SEM TEXTO FORA DO JSON, seguindo exatamente o schema definido abaixo.

Nunca adicione comentários ou explicações fora do JSON.

Se o usuário pedir várias receitas, retorne um ARRAY de objetos de receita.
`;

export function getRecipeGenerator() {
  if (cachedModel) return cachedModel;

  const genAI = new GoogleGenerativeAI(API_KEY);

  cachedModel = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.8,
    },
  });

  return cachedModel;
}
