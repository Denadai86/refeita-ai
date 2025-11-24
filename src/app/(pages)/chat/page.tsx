// src/app/(pages)/chat/page.tsx
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
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { Send, LogOut, ChefHat } from 'lucide-react'

interface Message {
  id?: string
  role: 'user' | 'model'
  content: string
  createdAt?: any
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  // Carrega mensagens do Firestore
  useEffect(() => {
    if (!user) return

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
    if (!input.trim() || loading || !user) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // 1. Salva mensagem do usuário
    await addDoc(collection(db, 'users', user.uid, 'chats'), {
      role: 'user',
      content: userMessage,
      createdAt: serverTimestamp(),
    })

    // 2. Chama a API Gemini (agora pede 2 receitas explicitamente)
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Me cria DUAS receitas completas, deliciosas e brasileiras usando o máximo possível desses ingredientes que tenho agora: ${userMessage}. Quero nome criativo, tempo, ingredientes com ✅ e passo a passo numerado!`,
        history: messages,
      }),
    })

    if (!response.ok || !response.body) {
      setLoading(false)
      return
    }

    // 3. Cria mensagem vazia da IA no Firestore
    const aiMessageRef = await addDoc(collection(db, 'users', user.uid, 'chats'), {
      role: 'model',
      content: '',
      createdAt: serverTimestamp(),
    })

    // 4. Streaming + atualização em tempo real
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let aiContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      aiContent += chunk

      // Atualiza Firestore (agora com updateDoc, que aceita o objeto)
      await updateDoc(doc(db, 'users', user.uid, 'chats', aiMessageRef.id), {
        content: aiContent,
      })

      // Atualiza estado local (streaming letra por letra)
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last?.role === 'model') last.content = aiContent
        return updated
      })
    }

    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-xl">Faça login pra usar o Refeita AI</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/refeita-ai.png"
              alt="Refeita AI Logo"
              className="w-12 h-12 rounded-full object-cover"
            />
            <ChefHat size={32} />
            <h1 className="text-2xl font-bold">Refeita AI</h1>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </header>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="text-center mt-20 text-gray-600">
            <ChefHat size={80} className="mx-auto mb-4 text-green-500" />
            <p className="text-xl">
              Oi! Me conta o que tem na sua geladeira que eu monto duas receitas incríveis pra você!
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={msg.id || i}
            className={`mb-6 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl p-6 rounded-2xl shadow-md ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {msg.role === 'model' ? (
                <div className="prose prose-lg max-w-none space-y-10">
                  {msg.content
                    .split(/###RECEITA [1-2]###/)
                    .filter(Boolean)
                    .map((recipe, i) => (
                      <div
                        key={i}
                        className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-3xl border-4 border-orange-300 shadow-2xl transform hover:scale-[1.02] transition-all"
                      >
                        <div className="text-3xl font-black text-orange-800 mb-4 flex items-center gap-3">
                          Receita {i + 1} – O CHEF MANDOU!
                        </div>
                        <div
                          className="text-gray-800 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: recipe
                              .trim()
                              .replace(/\n/g, '<br>')
                              .replace(/✅/g, '<span class="text-green-600 font-bold">✅</span>')
                              .replace(/➡️/g, '<span class="text-blue-600">➡️</span>'),
                          }}
                        />
                      </div>
                    ))}

                  {/* Fallback se o Gemini ignorar o formato */}
                  {msg.content.includes('###RECEITA') === false && (
                    <div className="bg-white p-8 rounded-2xl border-2 border-gray-300">
                      <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br>') }} />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-lg">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-6">
            <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-md">
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
      <form onSubmit={handleSubmit} className="p-6 bg-white border-t">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: tenho frango, batata, cebola, alho, tomate e arroz..."
            className="flex-1 px-6 py-4 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-4 rounded-full transition flex items-center justify-center"
          >
            <Send size={28} />
          </button>
        </div>
      </form>
    </div>
  )
}