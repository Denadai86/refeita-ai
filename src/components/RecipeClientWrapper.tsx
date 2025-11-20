// src/components/RecipeClientWrapper.tsx

'use client';

import { useState } from 'react';
import RecipeForm from './RecipeForm';
import { RecipeActionState, RecipeDetail } from '@/types/recipe';

export default function RecipeClientWrapper() {
  const [result, setResult] = useState<RecipeActionState | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleGenerated(state: RecipeActionState) {
    setResult(state);
    // Abre automaticamente a primeira receita gerada para melhor UX
    if (state.success && state.recipes && state.recipes.length > 0) {
      setOpenIndex(0);
    } else {
      setOpenIndex(null);
    }
  }

  function toggleIndex(index: number) {
    setOpenIndex(prev => (prev === index ? null : index));
  }

  const recipes: RecipeDetail[] = result?.recipes || [];

  return (
    <div className="max-w-2xl mx-auto px-4">

      {/* Formulário */}
      <RecipeForm onRecipeGenerated={handleGenerated} />

      {/* Nada gerado ainda */}
      {!result && (
        <p className="mt-10 text-center text-gray-500 text-sm">
          Preencha acima para gerar receitas com o que você tem em casa.
        </p>
      )}

      {/* Erro ou Array Vazio */}
      {result && (!result.success || recipes.length === 0) && (
        <div className="mt-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm text-center">
          {result.message || "A IA não conseguiu gerar receitas com esses parâmetros. Tente simplificar."}
        </div>
      )}

      {/* Lista de receitas */}
      {recipes.length > 0 && (
        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            🍽️ Receitas Sugeridas
          </h2>

          {recipes.map((recipe, index) => (
            <div key={index} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden transition-all hover:shadow-md">

              {/* Cabeçalho do Card (Sempre visível) */}
              <button
                className="w-full flex justify-between items-center px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                onClick={() => toggleIndex(index)}
              >
                <div>
                  <h3 className="font-bold text-lg text-gray-800">
                    {recipe.name || recipe.recipeName || `Opção ${index + 1}`}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1 flex gap-3">
                    {recipe.prepTime && <span>⏱️ {recipe.prepTime} min</span>}
                    {recipe.difficulty && <span>📊 {recipe.difficulty}</span>}
                    {recipe.calories && <span>🔥 {recipe.calories} cal</span>}
                  </div>
                </div>
                <span className={`transform transition-transform duration-200 text-gray-400 ${openIndex === index ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {/* Conteúdo expandido */}
              {openIndex === index && (
                <div className="px-5 py-5 space-y-6 text-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                  
                  {/* Ingredientes */}
                  {Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        🛒 Ingredientes
                      </h4>
                      <ul className="list-disc ml-5 space-y-1 text-sm">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>
                            {/* Correção Crítica: Renderiza a string direta.
                               Se por acaso vier objeto (fallback), tenta renderizar amigavelmente.
                            */}
                            {typeof ing === 'string' ? ing : JSON.stringify(ing).replace(/["{}]/g, '').replace(/:/g, ': ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Modo de Preparo */}
                  {Array.isArray(recipe?.instructions) && recipe.instructions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        👨‍🍳 Modo de Preparo
                      </h4>
                      <ol className="list-decimal ml-5 space-y-2 text-sm marker:font-bold marker:text-gray-500">
                        {recipe.instructions.map((step, i) => (
                          <li key={i} className="pl-1">{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Dicas Extras (opcional) */}
                  {Array.isArray(recipe?.tips) && recipe.tips.length > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      <b>💡 Dica do Chef:</b>
                      <ul className="list-disc ml-5 mt-1">
                         {recipe.tips.map((tip, i) => <li key={i}>{tip}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}