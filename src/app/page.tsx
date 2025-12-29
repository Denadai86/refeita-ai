'use client'

import RecipeClientWrapper from '@/components/RecipeClientWrapper'
import Header from '@/components/Header' // Importando o componente novo

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* 1. HEADER UNIFICADO */}
      <Header />

      {/* 2. BOTÃO VOLTAR AO PORTAL */}
      <a
        href="https://acaoleve.com"
        className="fixed bottom-6 right-6 z-40 bg-sky-700 hover:bg-sky-800 text-white font-bold py-3 px-6 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-2 text-sm"
      >
        <span>🔙</span>
        <span>Voltar ao Portal</span>
      </a>

      {/* 3. HERO SECTION (BANNER) */}
      <div className="bg-green-600 text-white pb-20 pt-10">
        <div className="max-w-5xl mx-auto px-6 text-center sm:text-left">
          <h2 className="text-4xl sm:text-6xl font-black mb-4 leading-tight">
            Sua geladeira, <br />
            <span className="text-green-300 italic">um banquete.</span>
          </h2>
          <p className="text-green-100 text-lg sm:text-xl max-w-2xl font-medium">
            Tire uma foto ou escreva o que tem sobrando. Nossa IA cria a receita perfeita para você em segundos.
          </p>
        </div>
      </div>

      {/* 4. GERADOR (SUBINDO O CONTEÚDO PARA CIMA DO BANNER) */}
      <main className="-mt-12 relative z-10 px-4">
        <RecipeClientWrapper />
      </main>
    </div>
  )
}