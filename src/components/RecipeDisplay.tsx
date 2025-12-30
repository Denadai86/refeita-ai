// src/components/RecipeDisplay.tsx
'use client';

import { RecipeDetail } from '@/types/recipe';
import { Clock, Users, Zap, Lightbulb, ChefHat } from 'lucide-react';
import ShareWhatsApp from './ShareWhatsApp';

export default function RecipeDisplay({ recipe, index }: { recipe: RecipeDetail, index: number }) {
  if (!recipe) return null;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden mb-10 transition-all hover:shadow-md">
      
      {/* CABEÇALHO ELEGANTE */}
      <div className="p-8 text-center bg-stone-50/50 border-b border-stone-100">
        <div className="flex justify-center mb-4">
           <span className="bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
             Sugestão {index > 0 ? `#${index}` : 'do Chef'}
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2 leading-tight">
          {recipe.name}
        </h1>
        <div className="h-1 w-12 bg-orange-400 mx-auto rounded-full" />
      </div>

      {/* METRICS - MAIS CLEAN */}
      <div className="flex justify-around py-4 bg-white border-b border-stone-100 text-stone-600">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-orange-500" />
          <span className="text-sm font-medium">{recipe.prepTime} min</span>
        </div>
        <div className="flex items-center gap-2 border-x border-stone-100 px-8">
          <Zap size={16} className="text-orange-500" />
          <span className="text-sm font-medium">{recipe.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-orange-500" />
          <span className="text-sm font-medium">{recipe.servings || '2'} porções</span>
        </div>
      </div>

      <div className="p-8 space-y-10">
        <div className="grid md:grid-cols-2 gap-12">
          {/* INGREDIENTES COM ESTILO CHECKLIST */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-400" />
              Ingredientes
            </h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-3 text-stone-700">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-300 shrink-0" />
                  <span className="text-md leading-tight">{ing.replace(/^(✓|➕)\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* PREPARO COM NÚMEROS DISCRETOS */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-stone-800 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-orange-400" />
              Modo de Preparo
            </h3>
            <ol className="space-y-6">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="text-stone-300 font-serif italic text-2xl leading-none">{i + 1}</span>
                  <p className="text-stone-600 leading-relaxed text-md">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* DICA - ESTILO NOTA ADESIVA SUAVE */}
        {recipe.tip && (
          <div className="p-6 bg-orange-50/50 border border-orange-100 rounded-2xl italic text-stone-700 text-center">
            "{recipe.tip}"
          </div>
        )}

        {/* SHARE */}
        <div className="pt-8 border-t border-stone-100 flex flex-col items-center gap-4">
          <p className="text-sm text-stone-400 font-medium">Gostou? Compartilhe com a família</p>
          <ShareWhatsApp recipeName={recipe.name} />
        </div>
      </div>
    </div>
  );
}