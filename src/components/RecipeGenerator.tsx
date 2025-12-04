// components/RecipeGenerator.tsx
'use client'; 

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import { RecipeActionState, RecipeDetail } from '@/types/recipe'; // Certifique-se que os tipos estão corretos

export function RecipeGenerator() {
  // O estado da receita gerada fica aqui, no Client Component.
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);

  const handleRecipeGenerated = (state: RecipeActionState) => {
    // Tratamento de sucesso e atualização de estado
    if (state.success && state.recipes && state.recipes.length > 0) {
      setGeneratedRecipe(state.recipes[0]);
    } else {
      // Adicionar lógica de tratamento de erro (ex: toast/alerta)
      console.error("Falha ao gerar receita:", state.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* O RecipeForm será um Client Component que chama uma Server Action */}
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
  );
}