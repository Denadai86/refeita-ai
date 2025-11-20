import { GoogleGenerativeAI } from "@google/generative-ai";

// Instância única do cliente (Singleton pattern para serverless)
let genAIClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY não definida nas variáveis de ambiente (.env.local)");
    }
    genAIClient = new GoogleGenerativeAI(apiKey);
  }
  return genAIClient;
}

export async function generateWithGemini(opts: {
  model: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<any> {
  const { model, prompt, temperature = 0.2, maxOutputTokens = 1024 } = opts;

  try {
    const client = getClient();
    
    // Instancia o modelo específico
    const genModel = client.getGenerativeModel({ 
      model: model,
      generationConfig: {
        temperature,
        maxOutputTokens,
      }
    });

    // Chamada padrão do SDK oficial
    const result = await genModel.generateContent(prompt);
    const response = await result.response;
    
    // Retorna o texto diretamente para facilitar, 
    // ou o objeto completo se precisar de metadados
    const text = response.text();
    
    // Retornamos um objeto que o seu llm.ts consegue ler (ele busca por .text ou .output)
    return {
      text: text,
      raw: response
    };

  } catch (error) {
    // Melhora a mensagem de erro para debug
    console.error(`[Gemini API Error] Model: ${model}`, error);
    throw error;
  }
}