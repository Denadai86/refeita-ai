// src/app/page.tsx
'use client'

import RecipeClientWrapper from '@/components/RecipeClientWrapper'

export default function Home() {
  return (
    <>
      {/* BOTÃO FIXO NO CANTO SUPERIOR DIREITO - FAIXA VERDE */}
<a
  href="https://acaoleve.com"
  className="fixed top-4 right-4 z-50 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
>
  <span className="text-xl">🔙</span>
  <span>Voltar ao Portal</span>
</a>


      {/* Conteúdo principal da Refeita AI */}
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Header lindo */}
        <header className="bg-green-600 text-white p-6 shadow-xl relative">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <img 
                src="/logo.png" 
                alt="Refeita AI" 
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-4xl font-black tracking-tight">Refeita AI</h1>
                <p className="text-green-100 text-lg">Transforme sua geladeira aleatória em uma experiência gastronômica global.</p>
              </div>
            </div>
          </div>
        </header>

        {/* Wrapper com formulário + receitas */}
        <main className="py-10">
          <RecipeClientWrapper />
        </main>

        {/* Rodapé discreto */}
        <footer className="mt-20 py-8 bg-gray-900 text-gray-400 text-center text-sm">
          <p>
            Feito com sabor e carinho {' '}
            <a href="https://acaoleve.com" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-bold">
              Ação Leve
            </a>
          </p>
        </footer>
      </div>
    </>
  )
}

export const runtime = 'edge'