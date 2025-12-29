'use client'

import RecipeClientWrapper from '@/components/RecipeClientWrapper'

export default function Home() {
  return (
    <>
      {/* BOTÃO FIXO - PORTAL */}
      <a
        href="https://acaoleve.com"
        className="fixed top-4 right-4 z-50 bg-sky-700 hover:bg-sky-800 text-white font-semibold py-3 px-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
      >
        <span className="text-xl">🔙</span>
        <span className="hidden sm:inline">Voltar ao Portal</span>
      </a>

      <div className="bg-gradient-to-b from-green-50 to-white">
        <header className="bg-green-600 text-white p-8 shadow-xl relative overflow-hidden">
          {/* Efeito visual discreto no header */}
          <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
             <img src="/android-chrome-512x512.png" className="w-64 h-64" alt="" />
          </div>

          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
            <div className="flex items-center gap-6 text-center sm:text-left flex-col sm:flex-row">
              <img
                src="/android-chrome-512x512.png" 
                alt="Refeita AI" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-2xl"
              />
              <div>
                <h1 className="text-5xl font-black tracking-tighter">Refeita AI</h1>
                <p className="text-green-100 text-xl max-w-xl">
                  Transforme sua geladeira aleatória em uma experiência gastronômica global.
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="py-12">
          <RecipeClientWrapper />
        </main>
      </div>
    </>
  )
}