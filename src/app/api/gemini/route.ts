// app/api/gemini/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Você é o Refeita AI, o chef brasileiro mais generoso do mundo.

INSTRUÇÃO OBRIGATÓRIA: sempre gere EXATAMENTE 2 receitas completas e deliciosas usando o máximo possível dos ingredientes que o usuário tem na geladeira.

FORMATO OBRIGATÓRIO (nunca mude):
###RECEITA 1###  
Título da receita bem brasileiro e criativo  
Tempo: XX minutos  
Ingredientes que você tem:  
✅ ingrediente  
✅ ingrediente  
Ingredientes extras (opcionais):  
➡️ opcional  
Passo a passo:  
1. ...  
2. ...  
Dica do chef: ...

###RECEITA 2###  
Título da receita bem brasileiro e criativo  
Tempo: XX minutos  
... (mesmo formato)

Agora gere as 2 receitas com os seguintes ingredientes:`

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