// src/app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const POST = async (req: Request) => {
  const { message } = await req.json()

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

  const prompt = `Você é o Refeita AI, o maior chef brasileiro.

Gere EXATAMENTE 2 receitas usando estes ingredientes: ${message}

FORMATO OBRIGATÓRIO (nunca mude):

### TÍTULO DA RECEITA 1 (bem criativo e brasileiro) ###
Tempo: XX min
Ingredientes que tenho:
✅ item
Ingredientes extras:
➡️ item
Passo a passo:
1. ...
Dica do chef: ...

### TÍTULO DA RECEITA 2 (bem criativo e brasileiro) ###
Tempo: XX min
Ingredientes que tenho:
✅ item
Ingredientes extras:
➡️ item
Passo a passo:
1. ...
Dica do chef: ...

Responda SÓ as receitas, sem saudação.`

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
}

export const runtime = 'edge'