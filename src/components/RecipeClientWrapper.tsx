// src/components/RecipeClientWrapper.tsx

'use client'

import RecipeGenerator from './RecipeGenerator'
import RecipeFeed from './RecipeFeed'
import { useAuth } from '@/contexts/AuthContext'
import { Sparkles } from 'lucide-react'

export default function RecipeClientWrapper() {
  const { user, login, loading } = useAuth();

  return (
    <div className="flex flex-col gap-12">
      
      {/* 1. Área Principal (O Coração: Gerador de Receitas) */}
      <section id="generator">
        <RecipeGenerator />
      </section>

      {/* 2. Área da Comunidade (Prova Social e Engajamento) */}
      <section id="community" className="relative">
        
        {/* Banner de Incentivo Discreto para Anônimos */}
        {/* Em vez de um botão gigante, usamos um convite contextual */}
        {!user && !loading && (
          <div className="max-w-5xl mx-auto mb-6">
            <div className="bg-indigo-600/10 border border-indigo-100 rounded-2xl py-4 px-6 text-center">
              <p className="text-indigo-900 text-sm font-medium flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400 fill-orange-400" />
                <span>
                  Quer salvar suas receitas favoritas? 
                  <button 
                    onClick={() => login()} 
                    className="ml-1 text-indigo-600 font-bold hover:underline"
                  >
                    Entre agora com sua conta Google
                  </button>
                  . É grátis!
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Título do Feed para dar contexto */}
        <div className="max-w-5xl mx-auto px-4 mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            🔥 Saindo do Forno agora
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-tighter animate-pulse">
              Ao vivo
            </span>
          </h2>
          <p className="text-gray-500 text-sm">Veja o que a comunidade está criando no Refeita-AI</p>
        </div>

        <RecipeFeed />
      </section>

    </div>
  )
}