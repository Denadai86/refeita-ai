// src/components/RecipeDisplay.tsx
'use client';

import { useState } from 'react';
import { RecipeDetail } from '@/types/recipe';
import { Clock, Zap, Lightbulb, ChefHat, ChevronDown, Flame } from 'lucide-react'; // Adicionado Flame
import ShareSocials from './ShareSocials';
import LikeButton from './LikeButton';

// Componente auxiliar para as tags (pills)
const MetaItem = ({ icon, value, label }: { icon: React.ReactNode, value: string | number, label: string }) => (
  <div className="flex items-center gap-1.5 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100 shadow-sm">
    <span className="text-orange-500">{icon}</span>
    <span className="text-sm font-bold whitespace-nowrap">{value}</span>
    <span className="text-[10px] uppercase text-stone-400 font-bold hidden sm:inline-block tracking-wider">{label}</span>
  </div>
);

export default function RecipeDisplay({ recipe, index }: { recipe: RecipeDetail, index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!recipe) return null;

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 overflow-hidden mb-8 ${
      isOpen ? 'border-orange-200 shadow-lg ring-1 ring-orange-100' : 'border-stone-200 hover:border-orange-200'
    }`}>
      
      {/* --- ÁREA CLICÁVEL (CABEÇALHO) --- */}
      <div 
        onClick={toggleOpen}
        className="cursor-pointer bg-white hover:bg-stone-50/50 transition-colors p-5 md:p-8"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-3 flex-1">
            
            {/* Badge Superior */}
            <div className="flex items-center gap-2">
              <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
                Receita #{index + 1}
              </span>
              {!isOpen && (
                <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded animate-pulse">
                  Ver detalhes
                </span>
              )}
            </div>
            
            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight">
              {recipe.name}
            </h1>

            {/* Métricas Resumidas (Agora com Calorias) */}
            <div className="flex flex-wrap gap-2 pt-2">
              <MetaItem icon={<Clock size={14} />} value={`${recipe.prepTime} min`} label="Tempo" />
              <MetaItem icon={<Zap size={14} />} value={recipe.difficulty} label="Nível" />
              {/* Calorias inseridas aqui */}
              <MetaItem icon={<Flame size={14} />} value={recipe.calories} label="Calorias" />
            </div>
          </div>

          {/* Botão de Toggle Visual */}
          <div className={`p-2 rounded-full border transition-all shrink-0 ${
            isOpen ? 'bg-orange-500 text-white border-orange-500 rotate-180' : 'bg-white text-stone-400 border-stone-200'
          }`}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      {/* --- BARRA DE AÇÕES (VISÍVEL SEMPRE) --- */}
      {!isOpen && (
        <div className="px-6 pb-6 flex items-center justify-between border-t border-stone-50 mt-2 pt-4">
          <LikeButton recipeId={recipe.id || 'preview'} initialLikes={recipe.likes || 0} />
          
          <button 
            onClick={toggleOpen}
            className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
          >
            Abrir receita completa
          </button>
        </div>
      )}

      {/* --- CONTEÚDO EXPANSÍVEL --- */}
      {isOpen && (
        <div className="border-t border-stone-100 bg-stone-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
          
          <div className="p-6 md:p-8 space-y-10">
            {/* Detalhes Completos */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Ingredientes */}
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                  <Lightbulb className="w-5 h-5 text-orange-400" />
                  Ingredientes
                </h3>
                <ul className="space-y-3">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700 text-sm md:text-base">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0" />
                      <span className="leading-snug">{ing.replace(/^(✓|➕)\s*/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preparo */}
              <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2 mb-4 border-b border-stone-100 pb-2">
                  <ChefHat className="w-5 h-5 text-orange-400" />
                  Modo de Preparo
                </h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex items-center justify-center bg-stone-100 text-stone-600 font-serif font-bold h-6 w-6 rounded-full shrink-0 text-xs mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-stone-600 leading-relaxed text-sm md:text-base">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Dica do Chef */}
            {recipe.tip && (
              <div className="p-5 bg-orange-50 border border-orange-100 rounded-xl flex gap-4">
                <ChefHat className="text-orange-500 shrink-0 h-6 w-6" />
                <div>
                    <h4 className="font-bold text-orange-800 text-sm mb-1">Dica do Chef</h4>
                    <p className="text-stone-700 italic text-sm">{recipe.tip}</p>
                </div>
              </div>
            )}

            {/* Rodapé Aberto */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-stone-200">
               <LikeButton recipeId={recipe.id || 'preview'} initialLikes={recipe.likes || 0} />
               
               <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
                 <span className="text-xs font-bold text-stone-500 mr-2">Compartilhar:</span>
                 <ShareSocials recipeName={recipe.name} ingredients={recipe.ingredients} />
               </div>
            </div>
          </div>
          
          {/* Botão Fechar no final */}
          <button 
            onClick={toggleOpen}
            className="w-full py-4 text-center bg-stone-100 text-stone-500 text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors"
          >
            Fechar Detalhes
          </button>
        </div>
      )}
    </div>
  );
}