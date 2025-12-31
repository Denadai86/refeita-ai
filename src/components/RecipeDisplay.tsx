// src/components/RecipeDisplay.tsx
'use client';

import { useState } from 'react';
import { RecipeDetail } from '@/types/recipe';
import { Clock, Zap, Lightbulb, ChefHat, ChevronDown, Flame } from 'lucide-react';
import ShareSocials from './ShareSocials';
import LikeButton from './LikeButton';

// Estilo de Papel (SVG Noise Pattern)
const PAPER_STYLE = {
  backgroundColor: '#fffbf2', // Um creme um pouco mais amarelado/velho
  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
  boxShadow: '2px 3px 10px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.03)' // Sombra suave para dar profundidade
};

const MetaItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
  <div className="flex items-center gap-1.5 text-stone-700 bg-white/60 px-3 py-1.5 rounded-full border border-stone-200/50 shadow-sm backdrop-blur-[2px]">
    <span className="text-orange-600">{icon}</span>
    <span className="text-sm font-bold whitespace-nowrap">{value}</span>
    <span className="text-[10px] uppercase text-stone-500 font-bold hidden sm:inline-block tracking-wider">{label}</span>
  </div>
);

export default function RecipeDisplay({ recipe, index }: { recipe: RecipeDetail, index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!recipe) return null;

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    // Aplicamos o PAPER_STYLE aqui no container principal
    <div 
      style={PAPER_STYLE}
      className={`rounded-3xl transition-all duration-300 overflow-hidden mb-8 relative ${
        isOpen ? 'ring-2 ring-orange-200/50 shadow-xl scale-[1.01]' : 'hover:shadow-md'
      }`}
    >
      
      {/* Detalhe visual: Um "durex" ou marca de dobra (opcional, mas fica charmoso) */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-black/5 to-transparent pointer-events-none" />

      {/* --- ÁREA CLICÁVEL (CABEÇALHO) --- */}
      <div 
        onClick={toggleOpen}
        className="cursor-pointer p-5 md:p-8 hover:bg-black/[0.02] transition-colors"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
            
            {/* Badge Superior */}
            <div className="flex items-center gap-2">
              <span className="bg-stone-800/10 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border border-stone-800/10">
                Receita #{index + 1}
              </span>
              {!isOpen && (
                <span className="text-[10px] text-orange-600 font-bold bg-orange-100/80 px-2 py-0.5 rounded animate-pulse">
                  Ver detalhes
                </span>
              )}
            </div>
            
            {/* Título com fonte Serifada bem marcada */}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight tracking-tight">
              {recipe.name}
            </h1>

            {/* Métricas Resumidas */}
            <div className="flex flex-wrap gap-2 pt-2">
              <MetaItem icon={<Clock size={14} />} value={`${recipe.prepTime} min`} label="Tempo" />
              <MetaItem icon={<Zap size={14} />} value={recipe.difficulty} label="Nível" />
              <MetaItem icon={<Flame size={14} />} value={recipe.calories} label="Calorias" />
            </div>
          </div>

          {/* Botão de Toggle Visual */}
          <div className={`p-2 rounded-full border transition-all shrink-0 bg-white/50 backdrop-blur-sm ${
            isOpen ? 'text-orange-600 border-orange-300 rotate-180' : 'text-stone-400 border-stone-300'
          }`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* --- BARRA DE AÇÕES (VISÍVEL SEMPRE) --- */}
      {!isOpen && (
        <div className="px-6 pb-6 pt-0 flex items-center justify-between border-t border-stone-800/10 mt-2 pt-4">
          <LikeButton recipeId={recipe.id || 'preview'} initialLikes={recipe.likes || 0} />
          
          <button 
            onClick={toggleOpen}
            className="text-xs font-bold text-stone-500 hover:text-orange-700 hover:underline decoration-orange-300 decoration-2 underline-offset-2"
          >
            Abrir receita completa
          </button>
        </div>
      )}

      {/* --- CONTEÚDO EXPANSÍVEL --- */}
      {isOpen && (
        <div className="border-t border-stone-800/10 bg-black/[0.02] animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="p-6 md:p-8 space-y-10">
            {/* Detalhes Completos */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Ingredientes - Estilo Caderno Pautado */}
              <div className="bg-white/70 p-6 rounded-xl border border-stone-200/60 shadow-sm relative">
                {/* Linhas de caderno decorativas */}
                <div className="absolute top-0 left-6 bottom-0 w-[1px] bg-red-300/30 hidden md:block"></div>
                
                <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b-2 border-stone-200 pb-2 relative z-10">
                  <Lightbulb className="w-5 h-5 text-orange-500" />
                  Ingredientes
                </h3>
                <ul className="space-y-3 relative z-10">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700 text-sm md:text-base font-medium">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 shrink-0" />
                      <span className="leading-snug">{ing.replace(/^(✓|➕)\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparo */}
              <div className="bg-white/70 p-6 rounded-xl border border-stone-200/60 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b-2 border-stone-200 pb-2">
                  <ChefHat className="w-5 h-5 text-orange-500" />
                  Modo de Preparo
                </h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex items-center justify-center bg-stone-800 text-white font-serif font-bold h-6 w-6 rounded-full shrink-0 text-xs mt-0.5 shadow-sm">
                        {i + 1}
                      </span>
                      <p className="text-stone-700 leading-relaxed text-sm md:text-base">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Dica do Chef - Estilo Post-it */}
            {recipe.tip && (
              <div className="p-5 bg-yellow-100/80 border-l-4 border-yellow-400 rounded-r-xl shadow-sm rotate-1 mx-2">
                <div className="flex gap-4">
                  <ChefHat className="text-yellow-700 shrink-0 h-6 w-6" />
                  <div>
                      <h4 className="font-bold text-yellow-900 text-sm mb-1 uppercase tracking-wider">Segredo do Chef</h4>
                      <p className="text-stone-800 italic text-sm font-serif">"{recipe.tip}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Rodapé Aberto */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800/10">
               <LikeButton recipeId={recipe.id || 'preview'} initialLikes={recipe.likes || 0} />
               
               <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                 <span className="text-xs font-bold text-stone-500 mr-2">Compartilhar:</span>
                 <ShareSocials recipeName={recipe.name} ingredients={recipe.ingredients} />
               </div>
            </div>
          </div>
          
          {/* Botão Fechar no final */}
          <button 
            onClick={toggleOpen}
            className="w-full py-4 text-center bg-stone-800/5 text-stone-500 text-xs font-bold uppercase tracking-widest hover:bg-stone-800/10 transition-colors border-t border-stone-800/5"
          >
            Fechar Receita
          </button>
        </div>
      )}
    </div>
  );
}