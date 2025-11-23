// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Você é o chef mais criativo e brasileiro do planeta.
O usuário vai te falar o que tem na geladeira. Crie EXATAMENTE 2 receitas completas, deliciosas, rápidas e que usem o máximo possível desses ingredientes.

REGRAS OBRIGATÓRIAS:
- Sempre 2 receitas, separadas por === ou ---
- Nome da receita bem brasileiro e criativo
- Tempo total estimado
- Lista de ingredientes que ele tem (com ✅)
- Ingredientes opcionais ou substitutos (com ➡️ )
- Passo a passo numerado
- Dica final de mestre-cuca

Exemplo de separador:
=== RECEITA 1: Feijão Tropeiro Turbinado ===
Tempo: 25 minutos
Ingredientes que você tem:
✅ Feijão cozido
✅ Linguiça calabresa
...
`

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json()

    const fullPrompt = `${SYSTEM_PROMPT}\n\nIngredientes que tenho agora: ${message}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.95,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    })

    const chat = model.startChat({
      history: history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      })),
    })

    const result = await chat.sendMessageStream(fullPrompt)

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) controller.enqueue(new TextEncoder().encode(text))
        }
        controller.close()
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (error: any) {
    console.error('Erro Gemini:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}