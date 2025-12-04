// src/components/RecipeDisplay.tsx (AJUSTADO PARA MOVER A DICA)

'use client';

import { RecipeDetail } from '@/types/recipe';
import { ChefHat, Clock, Users, Zap, Lightbulb, Flame } from 'lucide-react';
import React from 'react';

// ... (MetaItem e Tipagem mantidos) ...
const MetaItem = ({ icon, value, label }: { icon: any, value: any, label: string }) => (
  <div className="flex flex-col items-center p-3">
    <span className="text-red-500 mb-1">{icon}</span>
    <span className="text-lg font-bold text-gray-900">{value}</span>
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
  </div>
);

export default function RecipeDisplay({ recipe, index }: { recipe: RecipeDetail, index: number }) {
  if (!recipe) return null;

  const name = recipe.name || `Receita Surpresa #${index}`;
  const tip = recipe.tip || null; // Manter como null se não houver tip

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden border-t-8 border-red-500 mb-10 transition-transform hover:scale-[1.01]">
      
      {/* 1. CABEÇALHO COM NOME CRIATIVO */}
      <div className="p-8 text-center border-b border-gray-100 bg-gradient-to-b from-white to-gray-50">
        <span className="inline-block py-1 px-3 rounded-full bg-red-100 text-red-600 text-xs font-bold tracking-widest uppercase mb-4">
          Opção #{index}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-2">
          {name}
        </h1>
        <p className="text-gray-500 italic text-lg">
          Uma criação exclusiva do Refeita-AI
        </p>
      </div>

      {/* 2. DADOS TÉCNICOS */}
      <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50 border-b border-gray-200">
        <MetaItem icon={<Clock size={20} />} value={`${recipe.prepTime} min`} label="Tempo" />
        <MetaItem icon={<Flame size={20} />} value={recipe.difficulty} label="Nível" />
        <MetaItem icon={<Users size={20} />} value={recipe.servings || '2'} label="Porções" />
      </div>

      <div className="p-8 space-y-8">
        
        {/* 3. CONTEÚDO PRINCIPAL: 2 COLUNAS (Fica no topo do bloco de conteúdo) */}
        <div className="grid md:grid-cols-2 gap-10">
            
          {/* INGREDIENTES */}
          <div>
            <h3 className="flex items-center text-xl font-bold text-red-600 mb-4 pb-2 border-b border-red-100">
              <Lightbulb className="mr-2 h-5 w-5" /> Ingredientes
            </h3>
            <ul className="space-y-3">
              {recipe.ingredients.map((ing, i) => {
                const isCheck = ing.trim().startsWith('✓');
                const text = ing.replace(/^(✓|➕)\s*/, '').trim();
                return (
                  <li key={i} className="flex items-start text-lg">
                    <span className={`mr-3 font-bold ${isCheck ? 'text-green-500' : 'text-orange-400'}`}>
                      {isCheck ? '✓' : '+'}
                    </span>
                    <span className={isCheck ? 'text-gray-800 font-medium' : 'text-gray-500 italic'}>
                      {text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MODO DE PREPARO */}
          <div>
            <h3 className="flex items-center text-xl font-bold text-red-600 mb-4 pb-2 border-b border-red-100">
              <Zap className="mr-2 h-5 w-5" /> Modo de Preparo
            </h3>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex items-center justify-center bg-red-100 text-red-600 font-bold h-8 w-8 rounded-full shrink-0 text-sm">
                    {i + 1}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* 4. DICA DO CHEF (MOVIDO PARA AQUI - Fica no final do bloco de conteúdo) */}
        {tip && (
          <div className="flex gap-4 p-6 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg shadow-md">
            <ChefHat className="text-yellow-600 shrink-0 h-8 w-8" />
            <div>
              <h3 className="font-bold text-yellow-800 text-lg mb-1">Dica do Chef</h3>
              <p className="text-yellow-900 italic text-lg leading-relaxed">
                "{tip}"
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}