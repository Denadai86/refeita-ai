// Refeita.AI/src/components/RecipeDisplay.tsx
'use client';

import React from 'react';
import { RecipeDetail } from '@/types/recipe';
import { Utensils, Clock, User, Heart, Star, Send } from 'lucide-react';

type RecipeDisplayProps = {
  recipe: RecipeDetail;
  index: number;
};

/**
 * Exibe uma única receita gerada pela IA de forma estruturada.
 */
export default function RecipeDisplay({ recipe, index }: RecipeDisplayProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-2xl border border-green-100 mb-8 hover:shadow-green-200 transition duration-300">
      
      {/* Cabeçalho da Receita */}
      <header className="border-b pb-4 mb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-blue-700">
            {index + 1}. {recipe.recipeName}
          </h2>
          <p className="text-sm text-gray-600 mt-1">{recipe.description}</p>
        </div>
        {/* Botão de Salvar (Futuro: Requer Autenticação) */}
        <button
            className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition duration-150"
            aria-label="Salvar Receita"
            title="Salvar (Recurso Pro)"
        >
            <Heart className="h-5 w-5" />
        </button>
      </header>

      {/* Metadados */}
      <div className="flex space-x-6 text-sm text-gray-500 mb-6">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2 text-green-500" />
          <span>Preparo: {recipe.prepTime}</span>
        </div>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-green-500" />
          <span>Serve: {recipe.servings} pessoas</span>
        </div>
      </div>

      {/* Ingredientes e Instruções (Grid) */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Coluna 1: Ingredientes */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-1">
            Ingredientes Necessários
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex justify-between pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-green-600">
                <span className="font-medium">{ing.name}</span>
                <span className="text-gray-500">{ing.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 2: Instruções */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-1">
            Modo de Preparo
          </h3>
          <ol className="list-decimal list-outside space-y-3 text-gray-700 pl-5">
            {recipe.instructions.map((step, i) => (
              <li key={i}>
                <p className='font-medium'>Passo {i + 1}:</p>
                <p className="text-sm">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Dicas (Opcional) */}
      {recipe.tips && recipe.tips.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500 fill-yellow-500" />
                  Dicas do Chef IA
              </h3>
              <ul className="list-disc list-inside text-sm text-gray-600 pl-4 space-y-1">
                  {recipe.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                  ))}
              </ul>
          </div>
      )}
    </div>
  );
}