// src/components/RecipeClientWrapper.tsx

'use client';

import { useState } from 'react';
import RecipeForm from './RecipeForm';
import RecipeDisplay from './RecipeDisplay'; // <--- IMPORTANTE: Usando o componente bonito
import { RecipeActionState, RecipeDetail } from '@/types/recipe';

export default function RecipeClientWrapper() {
  const [result, setResult] = useState<RecipeActionState | null>(null);

  function handleGenerated(state: RecipeActionState) {
    setResult(state);
    // Scroll suave para o resultado quando ele aparecer
    if (state.success) {
      setTimeout(() => {
        const resultsElement = document.getElementById('results-section');
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  const recipes: RecipeDetail[] = result?.recipes || [];

  return (
    <div className="max-w-4xl mx-auto px-4">

      {/* 1. Formulário de Entrada */}
      <div className="mb-12">
        <RecipeForm onRecipeGenerated={handleGenerated} />
      </div>

      {/* 2. Mensagem de Estado Inicial (Vazio) */}
      {!result && (
        <div className="text-center py-10 opacity-50">
          <p className="text-gray-500 text-lg">
            👆 Os ingredientes vão ali em cima. A mágica acontece aqui embaixo.
          </p>
        </div>
      )}

      {/* 3. Mensagem de Erro */}
      {result && (!result.success || recipes.length === 0) && (
        <div className="mt-8 p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm text-center">
          <h3 className="font-bold text-lg mb-2">Ops, algo deu errado.</h3>
          <p>{result.message || "A IA não conseguiu gerar receitas. Tente simplificar os ingredientes."}</p>
        </div>
      )}

      {/* 4. Lista de Receitas (Usando o Componente Visual Novo) */}
      {recipes.length > 0 && (
        <div id="results-section" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">
              🍽️ O Chef Sugere:
            </h2>
            <p className="text-gray-500 mt-2">Escolha sua favorita e bom apetite!</p>
          </div>

          {recipes.map((recipe, index) => (
            // AQUI ESTÁ O SEGREDO: Usamos o RecipeDisplay que já é bonito e sabe ler 'tip'
            <RecipeDisplay 
              key={index} 
              recipe={recipe} 
              index={index + 1} 
            />
          ))}

        </div>
      )}
    </div>
  );
}