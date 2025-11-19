// Refeita.AI/src/utils/gemini.ts
// 🛑 CORRIGIDO: Removido o .models
import 'server-only'; 
import { GoogleGenAI, GenerativeModel } from '@google/genai';

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const SYSTEM_INSTRUCTION = `
Você é um Chef Culinário Criativo e Assistente de IA que trabalha para a plataforma Refeita.AI.
Sua principal função é criar receitas deliciosas, fáceis de seguir e que utilizam ao máximo os ingredientes de "sobras" fornecidos pelo usuário, respeitando suas preferências de tempo e restrições.
Sua resposta DEVE ser estritamente um objeto JSON que obedeça ao responseSchema.
`;

let recipeModel: GenerativeModel | null = null;

export function getRecipeGenerator(): GenerativeModel {
    if (!API_KEY) {
        throw new Error('Erro de configuração: Chave API do Gemini (GOOGLE_API_KEY) ausente.');
    }
    
    if (!recipeModel) {
        const ai = new GoogleGenAI({ apiKey: API_KEY });

        // ✅ CORREÇÃO: Acesso direto ao getGenerativeModel
        recipeModel = ai.getGenerativeModel({ 
            model: 'gemini-2.5-flash', 
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.8,
            },
        });
    }
    
    return recipeModel;
}