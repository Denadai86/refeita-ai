// src/app/(main)/page.tsx

'use client'; // 👈 Deve ser um Cliente para usar useState/useEffect

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import { RecipeActionState, RecipeDetail } from '@/types/recipe';
import { useSession } from 'next-auth/react'; // Para obter dados do usuário

export default function HomePage() {
  const { data: session } = useSession(); // Hook do NextAuth para contexto de usuário
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);

  // Função chamada pelo formulário após a Server Action retornar sucesso
  const handleRecipeGenerated = (state: RecipeActionState) => {
    // Usamos o primeiro item do array, pois forçamos numberOfRecipes = 1 no MVP
    if (state.recipes && state.recipes.length > 0) {
        setGeneratedRecipe(state.recipes[0]);
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 md:p-8">
      {/* Header simples */}
      <header className="py-8 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900">Refeita.AI</h1>
        <p className="mt-2 text-xl text-gray-600">
            Seu Chef IA: Crie receitas com o que você tem na geladeira.
        </p>
        {session?.user.name ? (
            <p className="mt-4 text-sm font-medium text-green-600">
                Olá, {session.user.name}! Você está logado e pronto para cozinhar.
            </p>
        ) : (
             <p className="mt-4 text-sm font-medium text-red-500">
                Você está como convidado. Logue para ter mais receitas no seu limite!
            </p>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Coluna do Formulário (Sempre visível) */}
        <RecipeForm onRecipeGenerated={handleRecipeGenerated} />

        {/* Coluna de Exibição da Receita (Condicional) */}
        {generatedRecipe ? (
          <RecipeDisplay recipe={generatedRecipe} />
        ) : (
          <div className="p-6 text-center bg-white rounded-xl shadow-md text-gray-500 italic">
            Sua receita gerada pelo Gemini aparecerá aqui!
          </div>
        )}
      </div>
    </main>
  );
}