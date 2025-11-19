// Refeita.AI/src/app/recipe/[id]/page.tsx
import { getRecipeBatchById } from '@/lib/recipe.server';
import RecipeDisplay from '@/components/RecipeDisplay';
import { Metadata } from 'next';

type RecipePageProps = {
  params: {
    id: string; // O ID do lote virá da URL (ex: /recipe/xyz123)
  };
};

// ----------------------------------------------------
// 1. Metadata Dinâmico (SEO)
// ----------------------------------------------------
export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  // A função getRecipeBatchById já trata o notFound()
  const batch = await getRecipeBatchById(params.id); 

  // Lista os ingredientes principais para um bom SEO
  const ingredients = batch.inputData.mainIngredients.split(',').map(s => s.trim()).join(', ');

  return {
    title: `Receitas com ${ingredients} | Refeita.AI`,
    description: `Descubra as receitas criadas pela IA usando ${ingredients}.`,
  };
}

// ----------------------------------------------------
// 2. Server Component Principal
// ----------------------------------------------------
export default async function RecipeBatchPage({ params }: RecipePageProps) {
  
  // 1. Busca de Dados no Servidor (Trata notFound se falhar)
  const recipeBatch = await getRecipeBatchById(params.id); 

  // Assumimos que recipeBatch existe e tem receitas, pois getRecipeBatchById trata o erro 404

  // 2. Renderização
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <header className="mb-8 p-4 bg-white rounded-lg shadow border border-blue-100">
            <h1 className="text-3xl font-extrabold text-gray-900">
                Suas Receitas Prontas
            </h1>
            <p className="text-lg text-gray-600 mt-2">
                Gerado com base nos ingredientes: <span className="font-semibold text-green-700">{recipeBatch.inputData.mainIngredients}</span>
            </p>
            {recipeBatch.inputData.restrictions && (
                <p className="text-sm text-gray-500 mt-1">
                    Filtros aplicados: {recipeBatch.inputData.restrictions}
                </p>
            )}
        </header>

        {/* Renderiza cada receita no lote */}
        {recipeBatch.generatedRecipes.map((recipe, index) => (
          <RecipeDisplay 
            key={index} 
            recipe={recipe} 
            index={index} 
          />
        ))}

        <footer className="mt-10 text-center text-sm text-gray-500">
            <p>Obrigado por usar Refeita.AI! Reduza o desperdício, aumente a criatividade.</p>
        </footer>

      </div>
    </main>
  );
}