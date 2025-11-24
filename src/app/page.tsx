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

  // Auth opcional
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  // Carrega histórico só se logado
  useEffect(() => {
    if (!user) {
      setMessages([])
      return
    }
    const q = query(
      collection(db, 'users', user.uid, 'chats'),
      orderBy('createdAt', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const loaded: Message[] = []
      snap.forEach((doc) => loaded.push({ id: doc.id, ...doc.data() } as Message))
      setMessages(loaded)
    })
    return () => unsub()
  }, [user])

  // Scroll suave
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
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])

    // Chama Gemini
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    })

    if (!response.ok || !response.body) {
      setMessages((prev) => [...prev, { role: 'model', content: 'Erro no servidor. Tenta de novo!' }])
      setLoading(false)
      return
    }

    // Streaming ULTRA FLUIDO (12 FPS — padrão apps premium)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let aiContent = ''
    let lastUpdate = Date.now()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      aiContent += decoder.decode(value, { stream: true })

      const now = Date.now()
      if (now - lastUpdate > 80) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (!last || last.role !== 'model') {
            updated.push({ role: 'model', content: aiContent })
          } else {
            last.content = aiContent
          }
          return updated
        })
        lastUpdate = now
        await new Promise((r) => setTimeout(r, 0))
      }
    }

    // Última atualização
    setMessages((prev) => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      if (last?.role === 'model') last.content = aiContent
      return updated
    })

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Banner login opcional */}
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
            <img src="/Refeita-ai.png" alt="Refeita AI" className="w-16 h-16 rounded-full object-cover" />
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

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && !loading && (
          <div className="text-center mt-20">
            <ChefHat size={100} className="mx-auto mb-6 text-green-600 animate-pulse" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              O que tem na sua geladeira hoje?
            </h2>
            <p className="text-xl text-gray-600">
              Me conta que eu crio duas receitas deliciosas na hora!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`mb-10 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-3xl p-8 rounded-3xl shadow-xl ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border-4 border-orange-200'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="space-y-16">
                  {msg.content
                    .split(/###\s*/)
                    .filter(Boolean)
                    .map((block, idx) => {
                      const lines = block.trim().split('\n')
                      const title = lines[0]?.trim() || `Receita ${idx + 1}`
                      const rest = lines.slice(1).join('\n')

                      return (
                        <div
                          key={idx}
                          className="bg-gradient-to-br from-orange-50 to-amber-50 p-10 rounded-3xl border-4 border-orange-400 shadow-2xl"
                        >
                          <h3 className="text-4xl font-black text-orange-800 mb-8 text-center">
                            {title}
                          </h3>
                          <div
                            className="text-gray-800 leading-relaxed text-lg prose max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: rest
                                .replace(/\n/g, '<br>')
                                .replace(/✅/g, '<span class="text-green-600 font-bold text-2xl">✅</span>')
                                .replace(/➡️/g, '<span class="text-blue-600 font-bold text-2xl">➡️</span>'),
                            }}
                          />
                        </div>
                      )
                    })}
                </div>
              ) : (
                <p className="text-xl">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex justify-start mb-10">
            <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-orange-200">
              <div className="flex gap-3">
                <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce" />
                <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce delay-100" />
                <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

{/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t shadow-2xl">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: frango, arroz, ovo, tomate... Se tiver retrições, me avisa!"
            className="flex-1 px-8 py-6 rounded-full border-4 border-green-300 focus:outline-none focus:border-green-600 text-xl placeholder-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-6 rounded-full transition-all shadow-2xl flex items-center justify-center"
          >
            <Send size={36} />
          </button>
        </div>
      </form>
    </div>
  )
}
export const runtime = 'edge'