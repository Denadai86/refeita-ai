// src/components/RecipeGenerator.tsx
'use client'; 

import { useState, useTransition, useEffect } from 'react'; // Adicionado useEffect
import RecipeForm from '@/components/RecipeForm';
import RecipeDisplay from '@/components/RecipeDisplay';
import LimitModal from '@/components/LimitModal';
import { useDailyLimit } from '@/hooks/useDailyLimit';
import { RecipeDetail, RecipeActionState } from '@/types/recipe';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecipe } from '@/lib/firestore-service';
import { generateRecipeAction } from '@/actions/recipe';
import { Loader2, CheckCircle2, Ticket, Save, LogIn } from 'lucide-react'; // Novos icones

export default function RecipeGenerator() {
  const { user, login } = useAuth(); // Import loginWithGoogle
  
  const { remaining, hasReachedLimit, incrementUsage } = useDailyLimit();
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  
  // Estado para guardar os dados do form caso precise salvar depois do login
  const [lastFormData, setLastFormData] = useState<{ingredients: string, recipeName: string} | null>(null);

  // Efeito para salvar automaticamente se o usuário acabou de logar e tinha uma receita pendente
  useEffect(() => {
    if (user && lastFormData && generatedRecipe && saveStatus === 'idle') {
      handleSaveRecipe();
    }
  }, [user]);

  const handleSaveRecipe = async () => {
    if (!user || !generatedRecipe || !lastFormData) return;

    try {
      setIsSaving(true);
      await saveRecipe({
        userId: user.uid,
        userName: user.displayName || 'Chef da Casa',
        ingredients: lastFormData.ingredients,
        recipeTitle: generatedRecipe.name,
        recipeContent: JSON.stringify(generatedRecipe),
        isPublic: true,
      });
      setSaveStatus('saved');
      setLastFormData(null); // Limpa pendência
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormSubmit = async (data: { 
    ingredients: string, 
    restrictions: string, 
    maxTime: string, 
    cuisinePreference: string 
  }) => {
    
    if (!user && hasReachedLimit) {
      setShowLimitModal(true);
      return;
    }

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
        
        // Guarda dados para caso ele queira salvar
        setLastFormData({
            ingredients: data.ingredients,
            recipeName: recipe.name
        });

        if (!user) {
          incrementUsage();
        } else {
          // Se já tá logado, salva direto (comportamento original)
          // Mas vamos usar a função unificada pra evitar duplicidade de código
           // Pequeno delay para garantir que o estado atualizou
           setTimeout(() => {
               setLastFormData({ ingredients: data.ingredients, recipeName: recipe.name });
               // O useEffect vai pegar isso ou chamamos direto:
               // Precisamos passar os dados direto pois o state pode não ter atualizado
               saveRecipe({
                userId: user.uid,
                userName: user.displayName || 'Chef da Casa',
                ingredients: data.ingredients,
                recipeTitle: recipe.name,
                recipeContent: JSON.stringify(recipe),
                isPublic: true,
              }).then(() => setSaveStatus('saved')).catch(() => setSaveStatus('error'));
           }, 0);
        }
      } else {
        alert(result.message || "Erro ao gerar receita.");
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4 relative">
      
      <LimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />

      {/* Contador de Créditos MAIS VISÍVEL */}
      {!user && (
        <div className="flex justify-center mb-[-25px] relative z-10 animate-pulse">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 border border-orange-200 shadow-sm">
            <Ticket className="w-4 h-4 text-orange-600" />
            Você tem {remaining} {remaining === 1 ? 'receita grátis' : 'receitas grátis'} hoje
          </div>
        </div>
      )}

      <RecipeForm onSubmit={handleFormSubmit} isLoading={isPending} />

      <div className="transition-all duration-500">
        {generatedRecipe ? (
          <div className="space-y-6">
            
            {/* ÁREA DE AÇÃO PÓS-GERAÇÃO (O Pulo do Gato) */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-stone-100 shadow-sm gap-4">
               <div className="flex items-center gap-2 text-stone-600">
                 <CheckCircle2 className="w-5 h-5 text-green-500" />
                 <span className="font-bold text-sm">Receita criada com sucesso!</span>
               </div>

               {user ? (
                 <div className="flex items-center gap-2">
                    {isSaving ? (
                      <span className="text-xs text-stone-500 flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
                      </span>
                    ) : saveStatus === 'saved' ? (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-bold bg-green-50 px-3 py-1 rounded-full border border-green-100">
                        <CheckCircle2 className="w-3 h-3" /> Salva no histórico
                      </span>
                    ) : null}
                 </div>
               ) : (
                 <button
                   onClick={() => login()}
                   className="flex items-center gap-2 bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-stone-800 hover:scale-105 transition-all shadow-lg active:scale-95 animate-bounce-slow"
                 >
                   <LogIn className="w-4 h-4" />
                   Salvar e Publicar na Comunidade
                 </button>
               )}
            </div>

            <RecipeDisplay recipe={generatedRecipe} index={1} />
          </div>
        ) : !isPending && (
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-12 text-center border-2 border-dashed border-stone-200">
            <h3 className="text-xl text-stone-700 font-bold mb-2 font-serif">A mágica acontece aqui</h3>
            <p className="text-stone-500">Combine ingredientes ou tire uma foto para começar.</p>
          </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
            <p className="mt-4 text-stone-600 font-serif italic">O Chef IA está criando sua receita...</p>
          </div>
        )}
      </div>
    </div>
  );
}