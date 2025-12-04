// src/components/ChatInterface.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, LogOut, ChefHat } from 'lucide-react'
import { type RecipeActionState } from '@/types/recipe'

interface Message {
  role: 'user' | 'model'
  content: string
}

export default function ChatInterface({ action }: { action: any }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage }])

    const formData = new FormData()
    formData.append('mainIngredients', userMessage)
    formData.append('restrictions', '')
    formData.append('prepTimePreference', 'Rápido (até 30min)')
    formData.append('cuisinePreference', 'brasileira')

    const state = await action(formData) as RecipeActionState

    if (state.success && state.recipes) {
      const recipesText = state.recipes.map((r, i) => `
### Receita ${i + 1}: ${r.name || 'Delícia Brasileira'} ###
⏱️ Tempo: ${r.prepTime} min | 📊 ${r.difficulty} | 🔥 ${r.calories || '???'} cal

🛒 Ingredientes:
${r.ingredients.map(i => `• ${i}`).join('\n')}

👨‍🍳 Modo de preparo:
${r.instructions.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

${r.tip ? `💡 Dica do chef: ${r.tip}` : ''}
      `.trim()).join('\n\n')

      setMessages(prev => [...prev, { role: 'model', content: recipesText }])
    } else {
      setMessages(prev => [...prev, { role: 'model', content: state.message || 'Desculpa, não consegui gerar receitas com isso. Tenta de novo!' }])
    }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">

      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/refeita-ai.png" alt="Refeita AI" className="w-12 h-12 rounded-full" />
            <ChefHat size={32} />
            <h1 className="text-2xl font-bold">Refeita AI - Chat</h1>
          </div>
          <a href="https://acaoleve.com/logout" className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg">
            <LogOut size={20} /> Sair
          </a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20 text-gray-600">
            <ChefHat size={80} className="mx-auto mb-4 text-green-500" />
            <p className="text-xl">Oi! Me conta o que tem na geladeira que eu monto receitas incríveis pra você!</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl p-6 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border'}`}>
              <pre className="whitespace-pre-wrap font-sans text-lg">{msg.content}</pre>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="bg-white border p-6 rounded-2xl shadow-md">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: tenho frango, batata, cebola, alho, tomate e arroz..."
            className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-full transition"
          >
            <Send size={28} />
          </button>
        </div>
      </form>
    </div>
  )
}