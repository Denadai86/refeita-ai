// src/app/page.tsx
'use client'

import RecipeClientWrapper from '@/components/RecipeClientWrapper'
//mport Header from '@/components/Header' // Importando o componente novo
//import AdminSeeder from '@/components/AdminSeeder';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* 3. HERO SECTION (BANNER) */}
      <div className="bg-green-600 text-white pb-10 pt-5">
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