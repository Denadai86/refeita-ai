// src/app/(main)/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import { RecipeActionState, RecipeDetail } from '@/types/recipe';

export default function HomePage() {
  const { data: session } = useSession();
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);

  const handleRecipeGenerated = (state: RecipeActionState) => {
    if (state.success && state.recipes && state.recipes.length > 0) {
      setGeneratedRecipe(state.recipes[0]);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
      <header className="py-12 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          Refeita.AI
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Seu Chef IA: Crie receitas incríveis com o que você tem na geladeira.
        </p>

        {session?.user ? (
          <p className="mt-6 text-lg font-medium text-green-600">
            Olá, {session.user.name || session.user.email}! Bem-vindo de volta
          </p>
        ) : (
          <p className="mt-6 text-lg font-medium text-amber-600">
            Você está como convidado • Faça login para salvar suas receitas!
          </p>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-12">
        <RecipeForm onRecipeGenerated={handleRecipeGenerated} />

        {generatedRecipe ? (
          <RecipeDisplay recipe={generatedRecipe} index={1} />
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border-4 border-dashed border-gray-300">
            <p className="text-2xl text-gray-500 font-medium">
              Sua receita mágica aparecerá aqui em segundos
            </p>
            <p className="mt-4 text-gray-400">
              Preencha o formulário acima e clique em "Gerar Receitas"
            </p>
          </div>
        )}
      </div>
    </main>
  );
}