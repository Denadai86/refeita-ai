// src/app/[id]/page.tsx
import { getRecipeBatchById } from '@/lib/recipe.server';
import RecipeDisplay from '@/components/RecipeDisplay';
import { Metadata } from 'next';

type RecipePageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const batch = await getRecipeBatchById(params.id);
  const ingredients = batch.inputData.mainIngredients
    .split(',')
    .map((s: string) => s.trim())
    .join(', ');

  return {
    title: `Receitas com ${ingredients} | Refeita.AI`,
    description: `Descubra as receitas criadas pela IA usando ${ingredients}.`,
  };
}

export default async function RecipeBatchPage({ params }: RecipePageProps) {
  const recipeBatch = await getRecipeBatchById(params.id);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <header className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-blue-100">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Suas Receitas Prontas
          </h1>
          <p className="text-lg text-gray-700 mt-3">
            Gerado com base nos ingredientes:{' '}
            <span className="font-bold text-green-700">
              {recipeBatch.inputData.mainIngredients}
            </span>
          </p>
          {recipeBatch.inputData.restrictions && (
            <p className="text-sm text-gray-600 mt-2">
              Filtros aplicados: {recipeBatch.inputData.restrictions}
            </p>
          )}
        </header>

        {/* CORREÇÃO FINAL AQUI */}
        {recipeBatch.generatedRecipes.map((recipe: any, index: number) => (
          <RecipeDisplay
            key={recipe.id || index}
            recipe={recipe}
            index={index + 1}
          />
        ))}

        <footer className="mt-16 text-center text-gray-500">
          <p className="text-sm">
            Refeita.AI — Menos desperdício, mais sabor.
          </p>
        </footer>
      </div>
    </main>
  );
}