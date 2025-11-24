// src/app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  throw new Error('GEMINI_API_KEY não configurada no .env.local')
}

const genAI = new GoogleGenerativeAI(apiKey)

export const POST = async (req: Request) => {
  try {
    const { message } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    const prompt = `Gere EXATAMENTE 2 receitas brasileiras completas usando estes ingredientes: ${message}

FORMATO OBRIGATÓRIO:
### TÍTULO DA RECEITA 1 (criativo e brasileiro) ###
Tempo: XX min
Ingredientes que tenho:
✅ item
Ingredientes extras:
➡️ item
Passo a passo:
1. ...
Dica do chef: ...

### TÍTULO DA RECEITA 2 (criativo e brasileiro) ###
(mesmo formato)

Responda SÓ as receitas.`

    const result = await model.generateContentStream(prompt)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          controller.enqueue(new TextEncoder().encode(chunk.text()))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('Gemini error:', error)
    return new Response('Erro no servidor. Tenta de novo!', { status: 500 })
  }
}

export const runtime = 'edge'