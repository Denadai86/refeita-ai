'use client'; 

import { useState } from 'react';
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import { RecipeActionState, RecipeDetail } from '@/types/recipe';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecipe } from '@/lib/firestore-service';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RecipeGenerator() {
  const { user } = useAuth();
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  const handleRecipeGenerated = async (state: RecipeActionState) => {
    // 1. Validação básica
    if (!state.success || !state.recipes || state.recipes.length === 0) {
      console.error("Falha ao gerar receita:", state.message);
      // Aqui você poderia disparar um Toast de erro
      return;
    }

    const recipe = state.recipes[0];
    setGeneratedRecipe(recipe);
    
    // 2. Lógica de "Auto-Save" ou "Community Feed"
    // Se o usuário estiver logado, salvamos automaticamente no histórico dele.
    if (user) {
      try {
        setIsSaving(true);
        await saveRecipe({
          userId: user.uid,
          userName: user.displayName || 'Chef da Casa',
          ingredients: Array.isArray(recipe.ingredients) 
            ? recipe.ingredients.join(', ') // Converte array p/ string para busca simples
            : String(recipe.ingredients),
          recipeTitle: recipe.name,
          recipeContent: JSON.stringify(recipe), // Salvamos o objeto completo para renderizar depois
          isPublic: true, // MVP: Tudo é público para criar movimento no feed!
        });
        setSaveStatus('saved');
      } catch (err) {
        console.error("Erro ao salvar no firebase:", err);
        setSaveStatus('error');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      
      {/* Formulário de Entrada */}
      <RecipeForm onRecipeGenerated={handleRecipeGenerated} />

      {/* Área de Resultado */}
      <div className="transition-all duration-500 ease-in-out">
        {generatedRecipe ? (
          <div className="space-y-4">
            {/* Feedback de Salvamento (Discreto) */}
            {user && (
              <div className="flex justify-end">
                {isSaving ? (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Salvando no seu livro...
                  </span>
                ) : saveStatus === 'saved' ? (
                  <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Salvo no seu histórico
                  </span>
                ) : null}
              </div>
            )}

            <RecipeDisplay recipe={generatedRecipe} index={1} />
            
            {/* CTA Pós-Receita (Upsell de Ação) */}
            <div className="text-center pt-6 pb-2">
              <p className="text-gray-500 text-sm italic">
                "Cozinhar é fazer poesia para ser degustada."
              </p>
            </div>
          </div>
        ) : (
          // Estado Vazio (Empty State) Bonito
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-sm p-12 text-center border-2 border-dashed border-gray-200 hover:border-green-200 transition-colors">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🍲</span>
            </div>
            <h3 className="text-xl text-gray-700 font-bold mb-2">
              Sua cozinha, suas regras
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Preencha os ingredientes acima, tire uma foto da geladeira ou use sua imaginação. 
              A mágica acontece aqui em baixo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}