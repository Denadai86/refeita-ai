// src/app/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { db, auth } from '@/firebase/config'
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore'
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { Send, LogOut, ChefHat } from 'lucide-react'

interface Message {
  id?: string
  role: 'user' | 'model'
  content: string
  createdAt?: any
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auth (não bloqueia mais)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  // Carrega mensagens (só se tiver usuário logado)
  useEffect(() => {
    if (!user) {
      setMessages([])
      return
    }

    const q = query(
      collection(db, 'users', user.uid, 'chats'),
      orderBy('createdAt', 'asc')
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const loaded: Message[] = []
      snapshot.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Message))
      setMessages(loaded)
    })

    return () => unsub()
  }, [user])

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!input.trim() || loading) return

  const userMessage = input.trim()
  setInput('')
  setLoading(true)

  // Mensagem do usuário
  setMessages(prev => [...prev, { role: 'user' as const, content: userMessage }])

  // Chama a API de verdade
  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userMessage }),
  })

  if (!response.ok || !response.body) {
    setMessages(prev => [...prev, { role: 'model' as const, content: 'Erro no servidor. Tenta de novo!' }])
    setLoading(false)
    return
  }

  // Streaming real do Gemini
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let aiContent = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    aiContent += chunk

    for (const char of chunk) {
    await new Promise(resolve => setTimeout(resolve, 15)) // 25ms = perfeito pro celular
    setMessages(prev => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      if (!last || last.role !== 'model') {
        updated.push({ role: 'model', content: aiContent })
      } else {
        last.content = aiContent
      }
      return updated
    })
  }
}

  setLoading(false)
}

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Banner de login opcional */}
      {!user && (
        <div className="bg-amber-100 border-b border-amber-300 px-6 py-3 text-center">
          <p className="text-amber-900 text-sm">
            <strong>Dica:</strong> Faça login pra salvar seu histórico!{' '}
            <button
              onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}
              className="underline font-semibold hover:text-amber-700"
            >
              Entrar com Google
            </button>
          </p>
        </div>
      )}

      {/* Header com logo */}
      <header className="bg-green-600 text-white p-5 shadow-xl">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/Refeita-ai.png" alt="Refeita AI" className="w-22 h-22 rounded-full" />
            <h1 className="text-3xl font-bold">Refeita AI</h1>
          </div>
          {user && (
            <button
              onClick={() => signOut(auth)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-5 py-3 rounded-lg transition"
            >
              <LogOut size={22} />
              Sair
            </button>
          )}
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && !loading && (
          <div className="text-center mt-20">
            <ChefHat size={90} className="mx-auto mb-6 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              O que você tem na geladeira hoje?
            </h2>
            <p className="text-lg text-gray-600">
              Me conta que eu crio duas receitas deliciosas na hora!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`mb-8 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-6 rounded-3xl shadow-lg ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border-2 border-gray-200'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="space-y-12">
                  {msg.content.split(/###\s*/).filter(Boolean).map((block, i) => {
                    if (!block.trim()) return null
                    const lines = block.trim().split('\n')
                    const title = lines[0].trim()
                    const rest = lines.slice(1).join('\n')

                    return (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-orange-50 to-amber-50 p-8 rounded-3xl border-4 border-orange-300 shadow-2xl"
                      >
                        <h3 className="text-3xl font-black text-orange-800 mb-6 text-center">
                          {title}
                        </h3>
                        <div
                          className="text-gray-800 leading-relaxed text-base prose"
                          dangerouslySetInnerHTML={{
                            __html: rest
                              .replace(/\n/g, '<br>')
                              .replace(/✅/g, '<span class="text-green-600 font-bold">✅</span>')
                              .replace(/➡️/g, '<span class="text-blue-600">➡️</span>'),
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-lg">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-3xl shadow-lg border-2 border-gray-200">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-green-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-6 bg-white border-t shadow-xl">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: frango, arroz, tomate, cebola..."
            className="flex-1 px-6 py-5 rounded-full border-2 border-gray-300 focus:outline-none focus:border-green-500 text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-5 rounded-full transition-all shadow-lg"
          >
            <Send size={32} />
          </button>
        </div>
      </form>
    </div>
  )
}