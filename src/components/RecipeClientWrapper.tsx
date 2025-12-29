'use client'

import { useState } from 'react'
import RecipeGenerator from './RecipeGenerator'
import { RecipeFeed } from './RecipeFeed'
import { useAuth } from '@/contexts/AuthContext'
import { LogIn, User, Sparkles } from 'lucide-react'

export default function RecipeClientWrapper() {
  const { user, login, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Lógica simples para incentivar login
  const handleLoginClick = async () => {
    await login();
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Barra de Usuário (Topo) */}
      <div className="max-w-5xl mx-auto w-full px-4 pt-4 flex justify-end">
        {loading ? (
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-full"></div>
        ) : user ? (
          <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-green-100">
             {user.photoURL ? (
               <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border border-green-200" />
             ) : (
               <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                 <User className="w-4 h-4 text-green-700" />
               </div>
             )}
             <div className="flex flex-col">
               <span className="text-xs font-bold text-gray-700 leading-none">Olá, {user.displayName?.split(' ')[0]}</span>
               <span className="text-[10px] text-green-600 font-medium">Membro Grátis</span>
             </div>
          </div>
        ) : (
          <button 
            onClick={handleLoginClick}
            className="group flex items-center gap-2 bg-white hover:bg-green-50 text-gray-700 px-5 py-2 rounded-full shadow-sm border border-gray-200 transition-all hover:border-green-300"
          >
            <div className="bg-green-100 p-1 rounded-full group-hover:bg-green-200 transition-colors">
              <LogIn className="w-4 h-4 text-green-700" />
            </div>
            <span className="font-semibold text-sm">Entrar para Salvar</span>
          </button>
        )}
      </div>

      {/* 2. Área Principal (Gerador) */}
      <div className="flex-grow">
        <RecipeGenerator />
      </div>

      {/* 3. Área da Comunidade (Feed) */}
      {/* User anonimo vê isso como prova social para fazer login */}
      <div className="relative">
        
        {/* Banner de Incentivo para Anônimos (Opcional - "Hypor") */}
        {!user && !loading && (
          <div className="bg-indigo-600 text-white py-3 px-4 text-center">
            <p className="text-sm font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Gostou? <button onClick={handleLoginClick} className="underline hover:text-indigo-200 font-bold">Faça login grátis</button> para salvar suas receitas e desbloquear mais limites!</span>
            </p>
          </div>
        )}

        <RecipeFeed />
      </div>

    </div>
  )
}