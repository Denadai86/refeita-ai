"use server";
import "server-only";

type AnyClient = any;

async function tryImport(pkg: string) {
  try {
    // use dynamic import para compatibilidade ESM/CJS
    return await import(pkg);
  } catch {
    return null;
  }
}

export async function getGeminiClient(): Promise<AnyClient> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Tenta novo SDK primeiro
  const pkgNew = await tryImport("@google/generative-ai");
  if (pkgNew) {
    // detecta possíveis exportações
    const ClientCtor =
      pkgNew?.GenerativeAI || pkgNew?.default || pkgNew?.GoogleGenerativeAI;
    if (ClientCtor) {
      try {
        // construtor pode aceitar { apiKey } ou outras opções dependendo da versão
        return new ClientCtor({ apiKey });
      } catch {
        // fallback: se construtor não aceitar objeto, tenta criar sem args
        try {
          return new ClientCtor();
        } catch {
          /* ignora */
        }
      }
    }
  }

  // Tenta SDK legado
  const pkgOld = await tryImport("@google/genai");
  if (pkgOld) {
    const ClientCtor =
      pkgOld?.GenerativeAI ||
      pkgOld?.default ||
      pkgOld?.TextServiceClient ||
      pkgOld?.Client;
    if (ClientCtor) {
      try {
        return new ClientCtor({ apiKey });
      } catch {
        try {
          return new ClientCtor();
        } catch {
          /* ignora */
        }
      }
    }
  }

  // Se nenhum SDK estiver disponível, lança. Chame gerador REST como fallback se preferir.
  throw new Error(
    "Nenhum SDK GenAI/Gemini disponível (tente instalar @google/generative-ai ou @google/genai)"
  );
}

export async function generateWithGemini(opts: {
  model: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<any> {
  const { model, prompt, temperature = 0.2, maxOutputTokens = 1024 } = opts;
  const client = await getGeminiClient();

  // Tenta várias formas de chamada dependendo da shape do SDK
  const attempts = [
    // novo SDK: client.models.generateContent or client.generateContent
    async () =>
      client.models?.generateContent
        ? client.models.generateContent({
            model,
            prompt: { text: prompt },
            temperature,
            maxOutputTokens,
          })
        : undefined,
    async () =>
      client.generateContent
        ? client.generateContent({
            model,
            prompt: { text: prompt },
            temperature,
            maxOutputTokens,
          })
        : undefined,
    // SDK legado: client.generate or client.text.generate (vários nomes encontrados na wild)
    async () =>
      client.generate
        ? client.generate({ model, prompt: { text: prompt }, temperature, maxOutputTokens })
        : undefined,
    async () =>
      client.text?.generate
        ? client.text.generate({ model, prompt: { text: prompt }, temperature, maxOutputTokens })
        : undefined,
    // Última tentativa: alguns SDKs retornam método com outros nomes
    async () =>
      client.createText ? client.createText({ model, prompt: prompt }) : undefined,
  ];

  let lastErr: any = null;
  for (const fn of attempts) {
    try {
      const res = await fn();
      if (res) return res;
    } catch (err) {
      lastErr = err;
    }
  }

  throw new Error(
    `Falha ao gerar com Gemini: nenhum método compatível no client. Último erro: ${
      (lastErr && (lastErr.message || String(lastErr))) || "desconhecido"
    }`
  );
}
