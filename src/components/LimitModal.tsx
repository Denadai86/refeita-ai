// src/components/LimitModal.tsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Lock, ChefHat, Sparkles } from 'lucide-react'

interface LimitModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LimitModal({ isOpen, onClose }: LimitModalProps) {
  // Certifique-se que seu AuthContext exporta 'loginWithGoogle'
  const { login } = useAuth()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100 relative overflow-hidden">
        
        {/* Efeito de Fundo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-orange-100 rounded-full blur-3xl opacity-50" />
        
        <div className="relative z-10 text-center space-y-6">
          <div className="bg-orange-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock className="w-8 h-8 text-orange-500" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-serif font-bold text-stone-800">
              O Chef precisa de descanso!
            </h3>
            {/* TEXTO ATUALIZADO: Singular para 1 receita */}
            <p className="text-stone-500">
              Você atingiu o limite de <span className="font-bold text-orange-600">1 receita gratuita</span> por dia como visitante.
            </p>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl text-left space-y-3 border border-stone-100">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Ao entrar você ganha:</p>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-stone-700 font-medium">
                <Sparkles className="w-4 h-4 text-green-500" /> Geração Ilimitada
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-700 font-medium">
                <ChefHat className="w-4 h-4 text-orange-500" /> Histórico de Receitas Salvo
              </li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                login()
                onClose()
              }}
              className="w-full bg-stone-900 text-white font-bold py-4 rounded-xl hover:bg-stone-800 hover:scale-[1.02] transition-all shadow-lg active:scale-95"
            >
              Entrar Grátis com Google
            </button>
            
            <button
              onClick={onClose}
              className="block w-full text-sm font-bold text-stone-400 hover:text-stone-600 py-2"
            >
              Voltar e ver receitas criadas
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}