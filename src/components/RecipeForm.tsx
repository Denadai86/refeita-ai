// Refeita.AI/src/components/RecipeForm.tsx
'use client';

import React, { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Utensils, Clock, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { generateRecipe } from '@/actions/recipe'; // A Server Action
import { RecipeActionState } from '@/types/recipe'; 
// O import RECIPE_MODEL foi removido permanentemente, pois é um dado de servidor.

// ----------------------------------------------------
// 1. Definições Iniciais
// ----------------------------------------------------

// Nome do modelo para exibição (usamos a string pura, não a variável de servidor)
const DISPLAY_MODEL_NAME = 'Gemini 2.5 Flash'; 

// Estado inicial para o useActionState
const initialState: RecipeActionState = {
    success: false,
    message: 'Pronto para criar receitas!',
};

// 🛑 CORREÇÃO 1: As strings devem bater EXATAMENTE com o Schema Zod em recipe.ts
const timeOptions = [
    'Qualquer',
    'SuperRápido(até 15min)', // 🎯 Adicionado e corrigido
    'Rápido (até 30min)', 
    'Normal (30-60min)',
];

// ----------------------------------------------------
// 2. Componente de Status e Loading (useFormStatus)
// ----------------------------------------------------
function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            aria-disabled={pending}
            disabled={pending}
            className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Gerando Receitas com IA... (5s)</span>
                </>
            ) : (
                <>
                    <Send className="h-5 w-5" />
                    <span>Gerar Receitas com Sobras</span>
                </>
            )}
        </button>
    );
}

// ----------------------------------------------------
// 3. Componente Principal do Formulário
// ----------------------------------------------------

export default function RecipeForm() {
    const router = useRouter();
    const [state, formAction] = useActionState(generateRecipe, initialState);

    // Efeito colateral: Lida com sucesso e redirecionamento
    useEffect(() => {
        if (state.success && state.recipeBatchId) {
            console.log(`Sucesso! Redirecionando para /recipe/${state.recipeBatchId}`);
            router.push(`/recipe/${state.recipeBatchId}`);
        }
    }, [state, router]);

    const showMessage = state.message && state.message !== initialState.message;

    return (
        <div className="max-w-xl mx-auto p-8 bg-white shadow-2xl rounded-xl">
            <header className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-blue-800 flex items-center space-x-3">
                    <Utensils className="h-7 w-7 text-green-600" />
                    <span>Refeita.AI: Sobras Inteligentes</span>
                </h1>
                <p className="text-gray-500 mt-2">
                    Liste os ingredientes que você tem na geladeira e deixe a IA criar novas receitas para você.
                </p>
                {/* 🛑 CORREÇÃO 2: Usa a string DISPLAY_MODEL_NAME em vez da variável indefinida RECIPE_MODEL */}
                <span className="text-xs text-gray-400 mt-1 block">
                    Powered by {DISPLAY_MODEL_NAME}
                </span>
            </header>
            
            {/* Mensagem de Erro/Feedback */}
            {showMessage && (
                <div 
                    className={`p-3 mb-6 rounded-lg flex items-center space-x-2 ${state.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800' 
                    }`}
                >
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-medium">{state.message}</p>
                </div>
            )}

            {/* O formAction é o handler da Server Action */}
            <form action={formAction} className="space-y-6">
                
                {/* 1. Ingredientes Principais */}
                <div>
                    <label htmlFor="mainIngredients" className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredientes Principais Disponíveis (Ex: Frango, Batata, Leite) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="mainIngredients"
                        name="mainIngredients"
                        rows={3}
                        required
                        placeholder="Lista de ingredientes, separados por vírgula ou em linhas."
                        className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                </div>

                {/* 2. Restrições e Preferências */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="restrictions" className="block text-sm font-medium text-gray-700 mb-1">
                            Restrições Dietéticas (Ex: Vegetariano, Sem Glúten)
                        </label>
                        <input
                            type="text"
                            id="restrictions"
                            name="restrictions"
                            defaultValue=""
                            placeholder="Deixe em branco se não houver"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label htmlFor="prepTimePreference" className="block text-sm font-medium text-gray-700 mb-1">
                            Tempo Máximo de Preparo
                        </label>
                        <select
                            id="prepTimePreference"
                            name="prepTimePreference"
                            defaultValue="Qualquer"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {/* 🛑 CORREÇÃO 3: Renderiza as opções que batem com o Zod */}
                            {timeOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 3. Preferência Culinária e Quantidade */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="cuisinePreference" className="block text-sm font-medium text-gray-700 mb-1">
                            Culinária (Ex: Brasileira, Mexicana)
                        </label>
                        <input
                            type="text"
                            id="cuisinePreference"
                            name="cuisinePreference"
                            defaultValue=""
                            placeholder="Deixe em branco para criatividade"
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="numberOfRecipes" className="block text-sm font-medium text-gray-700 mb-1">
                            Quantas Receitas Gerar
                        </label>
                        <input
                            type="number"
                            id="numberOfRecipes"
                            name="numberOfRecipes"
                            defaultValue={3}
                            min={1}
                            max={5}
                            required
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Máximo de 5 por chamada gratuita.</p>
                    </div>
                </div>
                
                {/* Botão de Submissão */}
                <SubmitButton />

            </form>
        </div>
    );
}