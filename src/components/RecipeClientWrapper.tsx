// src/components/RecipeClientWrapper.tsx

'use client'

import RecipeGenerator from './RecipeGenerator'
//import RecipeFeed from './RecipeFeed'
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



      </section>

    </div>
  )
}