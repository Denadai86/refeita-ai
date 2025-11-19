// src/components/RecipeDisplay.tsx

'use client';

import { RecipeDetail, IngredientItem } from '@/types/recipe';
import ReactMarkdown from 'react-markdown';
import { Clock, Users, Utensils, Zap } from 'lucide-react';

interface RecipeDisplayProps {
  recipe: RecipeDetail;
}

export default function RecipeDisplay({ recipe }: RecipeDisplayProps) {
  if (!recipe) return null;

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl border-t-4 border-green-600 space-y-8">
      
      {/* Cabeçalho */}
      <div className="text-center border-b pb-4">
        <h1 className="text-4xl font-extrabold text-green-700 mb-2">{recipe.recipeName}</h1>
        <p className="text-xl text-gray-600 italic">{recipe.description}</p>
      </div>

      {/* Meta Dados */}
      <div className="flex justify-around items-center bg-gray-50 p-4 rounded-lg shadow-inner">
        <div className="flex flex-col items-center">
          <Clock className="w-6 h-6 text-green-500" />
          <span className="text-lg font-bold mt-1 text-gray-800">{recipe.prepTime} min</span>
          <span className="text-sm text-gray-500">Preparo</span>
        </div>
        <div className="flex flex-col items-center">
          <Users className="w-6 h-6 text-green-500" />
          <span className="text-lg font-bold mt-1 text-gray-800">{recipe.servings}</span>
          <span className="text-sm text-gray-500">Porções</span>
        </div>
        <div className="flex flex-col items-center">
          <Zap className="w-6 h-6 text-green-500" />
          <span className="text-lg font-bold mt-1 text-gray-800">Gemini AI</span>
          <span className="text-sm text-gray-500">Gerado por</span>
        </div>
      </div>

      {/* Ingredientes e Instruções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Coluna 1: Ingredientes */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 flex items-center">
            <Utensils className="w-5 h-5 mr-2" /> Ingredientes
          </h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {recipe.ingredients.map((item: IngredientItem, index) => (
              <li key={index}>
                <span className="font-semibold">{item.quantity}</span> de {item.name}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Coluna 2: Instruções */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">
            Modo de Preparo
          </h3>
          {/* Usamos ReactMarkdown para renderizar a lista de instruções em Markdown */}
          <ol className="list-decimal pl-5 space-y-3 text-gray-700">
            {recipe.instructions.map((step, index) => (
              <li key={index}>
                <ReactMarkdown>{step}</ReactMarkdown>
              </li>
            ))}
          </ol>
        </div>
      </div>
      
      {/* Dicas (se houver) */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
          <h4 className="font-bold text-yellow-800">Dicas do Chef</h4>
          <ul className="list-disc pl-5 mt-2 text-yellow-700">
             {recipe.tips.map((tip, index) => (
                <li key={index}><ReactMarkdown>{tip}</ReactMarkdown></li>
             ))}
          </ul>
        </div>
      )}
    </div>
  );
}