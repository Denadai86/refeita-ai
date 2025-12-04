// src/app/[id]/page.tsx (Layout do Lote)

import { getRecipeBatchById } from '@/actions/recipe';
import RecipeDisplay from '@/components/RecipeDisplay';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeBatch, RecipeDetail } from '@/types/recipe'; 

type RecipePageProps = {
  params: { id: string };
};

// -------------------------------------------------------------------
// 1. Geração de Metadados (Mantido)
// -------------------------------------------------------------------
export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  // Assumindo que getRecipeBatchById é tipado para retornar Promise<RecipeBatch | null>
  const batch: RecipeBatch | null = await getRecipeBatchById(params.id); 
  
  if (!batch) {
    return { title: "Receitas não encontradas | Refeita.AI" };
  }

  const ingredients = batch.inputData.mainIngredients
    .split(',')
    .map((s: string) => s.trim())
    .join(', ');

  return {
    title: `Opções com ${ingredients} | Refeita.AI`,
    description: `Descubra as receitas criadas pela IA, incluindo nomes criativos e dicas do Chef, usando ${ingredients}.`,
  };
}

// -------------------------------------------------------------------
// 2. Componente Principal (UX Aprimorada)
// -------------------------------------------------------------------
export default async function RecipeBatchPage({ params }: RecipePageProps) {
  const recipeBatch: RecipeBatch | null = await getRecipeBatchById(params.id);
  
  // Tratamento de Not Found
  if (!recipeBatch || !recipeBatch.generatedRecipes || recipeBatch.generatedRecipes.length === 0) {
    notFound(); 
  }

  return (
    // Fundo cinza claro para contraste e destaque dos cards brancos
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12"> 
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Cabeçalho do Lote - Destaque Visual */}
        <header className="mb-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-l-8 border-red-500/80">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
            🎉 Suas Criações Culinárias Estão Prontas!
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-3">
            Geramos **{recipeBatch.generatedRecipes.length}** ideias. Escolha a sua próxima história:
          </p>
          <p className="text-xl mt-3">
            Baseado em:
            <span className="font-extrabold text-red-600 dark:text-red-400 ml-2">
              {recipeBatch.inputData.mainIngredients}
            </span>
          </p>
          {recipeBatch.inputData.restrictions && (
            <p className="text-md text-gray-600 dark:text-gray-500 mt-2 italic border-t pt-2 border-gray-100 dark:border-gray-700">
              Filtro: {recipeBatch.inputData.restrictions}
            </p>
          )}
        </header>

        {/* Listagem das Receitas com espaçamento generoso */}
        <div className="space-y-10">
          {recipeBatch.generatedRecipes.map((recipe: RecipeDetail, index: number) => (
            <RecipeDisplay
              key={recipe.name} 
              recipe={recipe}
              index={index + 1}
            />
          ))}
        </div>

        <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">
            Refeita.AI — Criando magia com o que você já tem.
          </p>
        </footer>
      </div>
    </main>
  );
}