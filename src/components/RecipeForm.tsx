'use client';

import { useEffect } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { RecipeActionState, PrepTimeOption } from '@/types/recipe';
import { generateRecipeAction } from '@/app/actions';

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
      className={`w-full py-3 px-4 font-bold rounded-lg shadow transition
      ${pending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}
    `}
    >
      {pending ? 'Gerando Receita IA...' : 'Gerar Receita! 👩‍🍳'}
    </button>
  );
}

interface RecipeFormProps {
  onRecipeGenerated?: (state: RecipeActionState) => void;
}

export default function RecipeForm({ onRecipeGenerated }: RecipeFormProps) {
  const [state, formAction] = useActionState(generateRecipeAction, initialState);

  const timeOptions: PrepTimeOption[] = [
    'SuperRápido(até 15min)',
    'Rápido (até 30min)',
    'Normal (30-60min)',
    'Qualquer',
  ];

  useEffect(() => {
    if (onRecipeGenerated && state.success && state.recipes) {
      onRecipeGenerated(state);
    }
  }, [state, onRecipeGenerated]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-2xl">
      <h2 className="text-2xl font-extrabold text-gray-800 mb-6">
        O que você tem na geladeira?
      </h2>

      {state.message && (
        <div
          className={`p-3 mb-4 rounded-lg font-medium ${
            state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredientes
          </label>
          <input
            name="mainIngredients"
            required
            placeholder="Ex: frango, cebola, batata"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restrições
          </label>
          <input
            name="restrictions"
            placeholder="Opcional"
            className="w-full p-3 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tempo de preparo
            </label>
            <select
              name="prepTimePreference"
              className="w-full p-3 border rounded-lg"
            >
              {timeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Culinária
            </label>
            <input
              name="cuisinePreference"
              placeholder="Opcional"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
