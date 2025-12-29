// src/components/RecipeForm.tsx
'use client';

import { useEffect, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ImageUploader } from './ImageUploader';
import { identifyIngredientsAction } from '@/actions/recipe'; 
import { RecipeActionState, PrepTimeOption } from '@/types/recipe';
import { generateRecipeAction } from '@/app/actions';
import { Loader2, Sparkles } from 'lucide-react';

const initialState: RecipeActionState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-4 px-4 font-bold rounded-xl shadow-lg transition-all active:scale-95
      ${pending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'}
    `}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" /> Gerando sua janta...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          Gerar Receita Mágica! 👩‍🍳
        </span>
      )}
    </button>
  );
}

interface RecipeFormProps {
  onRecipeGenerated?: (state: RecipeActionState) => void;
}

export default function RecipeForm({ onRecipeGenerated }: RecipeFormProps) {
  const [state, formAction] = useActionState(generateRecipeAction, initialState);
  
  // Estados para a funcionalidade de Visão (Foto)
  const [base64Images, setBase64Images] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [manualIngredients, setManualIngredients] = useState('');

  const timeOptions: PrepTimeOption[] = [
    'SuperRápido(até 15min)',
    'Rápido (até 30min)',
    'Normal (30-60min)',
    'Qualquer',
  ];

  // Função que chama a IA de Visão
  const handleVisionAnalysis = async () => {
    if (base64Images.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const result = await identifyIngredientsAction(base64Images);
      
      if (result.success && result.ingredients) {
        // Concatena o que a IA viu com o que já estava escrito
        setManualIngredients(prev => prev ? `${prev}, ${result.ingredients}` : result.ingredients);
      }
    } catch (err) {
      console.error("Erro na análise de visão:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (onRecipeGenerated && state.success && state.recipes) {
      onRecipeGenerated(state);
    }
  }, [state, onRecipeGenerated]);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <Sparkles className="text-yellow-500" /> O que temos pra hoje?
      </h2>

      {/* 1. SEÇÃO DE FOTO (VISÃO) */}
      <div className="mb-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
        <label className="block text-sm font-bold text-indigo-900 mb-3">
          Preguiça de digitar? Tire foto da geladeira/armário! 📸
        </label>
        
        <ImageUploader onImagesChange={setBase64Images} />
        
        {base64Images.length > 0 && (
          <button
            type="button"
            onClick={handleVisionAnalysis}
            disabled={isAnalyzing}
            className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isAnalyzing ? (
              <><Loader2 className="animate-spin w-4 h-4" /> Analisando fotos...</>
            ) : (
              "🔍 Identificar Ingredientes nas Fotos"
            )}
          </button>
        )}
      </div>

      {state.message && (
        <div className={`p-4 mb-6 rounded-xl font-bold text-sm ${
          state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        {/* Campo de Ingredientes (Controlado para aceitar o texto da IA) */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Ingredientes (escreva ou use a foto acima)
          </label>
          <textarea
            name="mainIngredients"
            required
            rows={3}
            value={manualIngredients}
            onChange={(e) => setManualIngredients(e.target.value)}
            placeholder="ex: arroz cozido, frango cru, legumes picados"
            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-green-500 focus:ring-0 transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Restrições ou preferências (ex: sem glúten, vegana)
          </label>
          <input
            name="restrictions"
            placeholder="Opcional"
            className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Tempo disponível
            </label>
            <select
              name="prepTimePreference"
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none bg-white"
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Estilo de Culinária
            </label>
            <input
              name="cuisinePreference"
              placeholder="Ex: Italiana, Mineira..."
              className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-green-500 outline-none"
            />
          </div>
        </div>

        <input type="hidden" name="numberOfRecipes" value="2" />

        <SubmitButton />
      </form>
    </div>
  );
}