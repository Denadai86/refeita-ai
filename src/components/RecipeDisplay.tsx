// src/components/RecipeDisplay.tsx

'use client';

import { RecipeDetail, IngredientItem } from '@/types/recipe';
import ReactMarkdown from 'react-markdown';
import { Clock, Users, Utensils, Zap, Lightbulb } from 'lucide-react';
import { ReactNode } from 'react'; // Para tipagem interna

// -------------------------------------------------------------------
// 1. TIPAGEM CORRIGIDA E REFINADA
// -------------------------------------------------------------------
interface RecipeDisplayProps {
  recipe: RecipeDetail;
  /** Número sequencial da receita no lote (e.g., 1, 2, 3...) */
  index: number; // <-- CORREÇÃO: Propriedade que faltava para resolver o BUILD_FAILED
}

// -------------------------------------------------------------------
// 2. SUB-COMPONENTE: Icone e Valor Meta
// -------------------------------------------------------------------
interface MetaItemProps {
  icon: ReactNode;
  value: string | number;
  label: string;
}
const MetaItem: React.FC<MetaItemProps> = ({ icon, value, label }) => (
  <div className="flex flex-col items-center p-2">
    <span className="text-green-500 mb-1">{icon}</span>
    <span className="text-xl font-bold text-gray-800">{value}</span>
    <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
  </div>
);

// -------------------------------------------------------------------
// 3. SUB-COMPONENTE: Meta Dados da Receita
// -------------------------------------------------------------------
const RecipeMetaData: React.FC<RecipeDisplayProps> = ({ recipe }) => (
  <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50 p-4 rounded-xl shadow-md border border-gray-100">
    <MetaItem
      icon={<Clock className="w-5 h-5" />}
      value={`${recipe.prepTime} min`}
      label="Preparo"
    />
    <MetaItem
      icon={<Users className="w-5 h-5" />}
      value={recipe.servings}
      label="Porções"
    />
    <MetaItem
      icon={<Zap className="w-5 h-5" />}
      value="Gemini AI"
      label="Gerado Por"
    />
  </div>
);

// -------------------------------------------------------------------
// 4. SUB-COMPONENTE: Lista de Ingredientes
// -------------------------------------------------------------------
const IngredientList: React.FC<{ ingredients: IngredientItem[] }> = ({ ingredients }) => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 flex items-center text-primary-700">
      <Utensils className="w-6 h-6 mr-2 text-primary-500" /> Ingredientes
    </h3>
    <ul className="list-disc ml-5 space-y-2 text-gray-700 marker:text-green-600">
      {ingredients.map((item: IngredientItem, index) => (
        <li key={index} className="text-lg">
          <span className="font-bold text-gray-900">{item.quantity}</span> de {item.name}
        </li>
      ))}
    </ul>
  </div>
);

// -------------------------------------------------------------------
// 5. SUB-COMPONENTE: Modo de Preparo (Instruções)
// -------------------------------------------------------------------
const Instructions: React.FC<{ instructions: string[] }> = ({ instructions }) => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-gray-800 border-b pb-2 text-primary-700">
      Modo de Preparo
    </h3>
    <ol className="list-decimal ml-5 space-y-4 text-gray-700 marker:font-bold marker:text-green-600">
      {instructions.map((step, index) => (
        <li key={index} className="pl-2">
          {/* ReactMarkdown aqui é crucial, pois as instruções podem ter formatação MD */}
          <ReactMarkdown>{step}</ReactMarkdown>
        </li>
      ))}
    </ol>
  </div>
);

// -------------------------------------------------------------------
// 6. COMPONENTE PRINCIPAL (RECEITA)
// -------------------------------------------------------------------
export default function RecipeDisplay({ recipe, index }: RecipeDisplayProps) {
  if (!recipe) return null;

  // Use cores primárias mais alinhadas com o Tailwind CSS (ex: green)
  return (
    <div className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition duration-300 border border-gray-200 space-y-8">
      
      {/* Cabeçalho */}
      <div className="text-center border-b pb-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-green-500 mb-1">
          Receita #{index}
        </h2>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 leading-tight">
          {recipe.recipeName}
        </h1>
        <p className="text-md text-gray-500 italic max-w-xl mx-auto">
          {recipe.description}
        </p>
      </div>

      {/* Meta Dados */}
      <RecipeMetaData recipe={recipe} index={index} />

      {/* Ingredientes e Instruções */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12 pt-4">
        
        {/* Coluna 1: Ingredientes (Ocupa 2/5) */}
        <div className="lg:col-span-2">
          <IngredientList ingredients={recipe.ingredients} />
        </div>
        
        {/* Coluna 2: Instruções (Ocupa 3/5) */}
        <div className="lg:col-span-3">
          <Instructions instructions={recipe.instructions} />
        </div>
      </div>
      
      {/* Dicas (se houver) */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="p-5 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg flex items-start mt-6">
          <Lightbulb className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" />
          <div className="flex-grow">
            <h4 className="font-bold text-yellow-800 text-lg mb-1">Dicas do Chef</h4>
            <ul className="list-disc pl-5 space-y-1 text-yellow-700">
              {recipe.tips.map((tip, idx) => (
                <li key={idx}><ReactMarkdown>{tip}</ReactMarkdown></li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}