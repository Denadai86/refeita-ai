'use client';

import { useState } from 'react';
import RecipeForm from './RecipeForm';
import { RecipeActionState, RecipeDetail } from '@/types/recipe';

export default function RecipeClientWrapper() {
  const [result, setResult] = useState<RecipeActionState | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function handleGenerated(state: RecipeActionState) {
    setResult(state);
    setOpenIndex(null);
  }

  function toggleIndex(index: number) {
    setOpenIndex(prev => (prev === index ? null : index));
  }

  const recipes: RecipeDetail[] = result?.recipes || [];

  return (
    <div className="max-w-2xl mx-auto">

      {/* Formulário */}
      <RecipeForm onRecipeGenerated={handleGenerated} />

      {/* Nada gerado ainda */}
      {!result && (
        <p className="mt-10 text-center text-gray-500">
          Nenhuma receita gerada ainda.
        </p>
      )}

      {/* Usuário gerou receitas, mas o array veio vazio */}
      {result && recipes.length === 0 && (
        <div className="mt-10 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
          ❗ A IA não conseguiu gerar receitas com esses ingredientes.<br />
          Tente adicionar mais ingredientes ou reduzir restrições.
        </div>
      )}

      {/* Lista de receitas */}
      {recipes.length > 0 && (
        <div className="mt-10 space-y-4">

          <h2 className="text-xl font-bold text-gray-800 mb-4">
            🍽️ Receitas Geradas ({recipes.length})
          </h2>

          {recipes.map((recipe, index) => (
            <div key={index} className="border rounded-lg shadow bg-white">

              {/* Botão de abrir/fechar */}
              <button
                className="w-full flex justify-between items-center px-4 py-3 font-semibold hover:bg-gray-50 text-left"
                onClick={() => toggleIndex(index)}
              >
                <span>{recipe?.recipeName || `Receita ${index + 1}`}</span>
                <span>{openIndex === index ? '▲' : '▼'}</span>
              </button>

              {/* Conteúdo expandido */}
              {openIndex === index && (
                <div className="px-4 py-3 border-t space-y-3 text-sm text-gray-700">
                  
                  {/* Descrição */}
                  {recipe?.description && <p>{recipe.description}</p>}

                  {/* Tempo e porções */}
                  {(recipe?.prepTime || recipe?.servings) && (
                    <p>
                      {recipe.prepTime && <b>Tempo:</b>} {recipe.prepTime} min<br />
                      {recipe.servings && <b>Porções:</b>} {recipe.servings}
                    </p>
                  )}

                  {/* Ingredientes */}
                  {Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0 && (
                    <div>
                      <b>Ingredientes:</b>
                      <ul className="list-disc ml-5">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing.quantity} — {ing.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Instruções */}
                  {Array.isArray(recipe?.instructions) && recipe.instructions.length > 0 && (
                    <div>
                      <b>Modo de Preparo:</b>
                      <ol className="list-decimal ml-5">
                        {recipe.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Dicas */}
                  {Array.isArray(recipe?.tips) && recipe.tips.length > 0 && (
                    <div>
                      <b>Dicas:</b>
                      <ul className="list-disc ml-5">
                        {recipe.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
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
