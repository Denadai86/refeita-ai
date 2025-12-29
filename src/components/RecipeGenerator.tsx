// src/components/RecipeGenerator.tsx
'use client'; 

import { useState, useTransition } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import { RecipeDetail, RecipeActionState } from '@/types/recipe';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecipe } from '@/lib/firestore-service';
import { generateRecipeAction } from '@/actions/recipe';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RecipeGenerator() {
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  // CORRIGIDO: Tipagem batendo com o RecipeForm
  const handleFormSubmit = async (data: { 
    ingredients: string, 
    restrictions: string, 
    maxTime: string, 
    cuisinePreference: string 
  }) => {
    setSaveStatus('idle');
    setGeneratedRecipe(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append('mainIngredients', data.ingredients);
      formData.append('restrictions', data.restrictions || "Nenhuma");
      formData.append('prepTimePreference', data.maxTime);
      formData.append('cuisinePreference', data.cuisinePreference);
      formData.append('numberOfRecipes', "1");

      const result: RecipeActionState = await generateRecipeAction(
        { success: false, message: '' }, 
        formData
      );

      if (result.success && result.recipes && result.recipes.length > 0) {
        const recipe = result.recipes[0];
        setGeneratedRecipe(recipe);
        
        if (user) {
          try {
            setIsSaving(true);
            await saveRecipe({
              userId: user.uid,
              userName: user.displayName || 'Chef da Casa',
              ingredients: data.ingredients,
              recipeTitle: recipe.name,
              recipeContent: JSON.stringify(recipe),
              isPublic: true,
            });
            setSaveStatus('saved');
          } catch (err) {
            console.error("Erro ao salvar:", err);
            setSaveStatus('error');
          } finally {
            setIsSaving(false);
          }
        }
      } else {
        alert(result.message || "Erro ao gerar receita.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <RecipeForm onSubmit={handleFormSubmit} isLoading={isPending} />

      <div className="transition-all duration-500">
        {generatedRecipe ? (
          <div className="space-y-4">
            {user && (
              <div className="flex justify-end">
                {isSaving ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Salvo no seu histórico
                  </span>
                ) : null}
              </div>
            )}
            <RecipeDisplay recipe={generatedRecipe} index={1} />
          </div>
        ) : !isPending && (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <h3 className="text-xl text-gray-700 font-bold mb-2">A mágica acontece aqui</h3>
            <p className="text-gray-500">Use a câmera ou digite seus itens para começar.</p>
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
            <p className="mt-4 text-gray-600">O Chef IA está criando sua receita...</p>
          </div>
        )}
      </div>
    </div>
  );
}