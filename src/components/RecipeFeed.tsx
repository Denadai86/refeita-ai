'use client'

import { useEffect, useState } from 'react';
import { getPublicFeed, SavedRecipe } from '@/lib/firestore-service';
import { Loader2, ChefHat, Heart } from 'lucide-react';

export function RecipeFeed() {
  const [feed, setFeed] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getPublicFeed(6); // Busca as últimas 6
      setFeed(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-green-600" /></div>;

  return (
    <section className="py-12 bg-orange-50/50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <ChefHat className="text-orange-500" />
            O que estão cozinhando agora?
          </h2>
          <p className="text-gray-600 mt-2">Ideias reais de geladeiras reais pelo Brasil.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feed.map((recipe) => (
            <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {recipe.userName || 'Chef Anônimo'}
                </span>
                <span className="text-xs text-gray-400">Recente</span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                {recipe.recipeTitle}
              </h3>
              
              <p className="text-sm text-gray-500 mb-4 line-clamp-3 italic">
                "Ingredientes usados: {recipe.ingredients.slice(0, 50)}..."
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                  <Heart className="w-4 h-4" /> {recipe.likes || 0}
                </button>
                <button className="text-indigo-600 font-medium hover:underline">
                  Ver Receita →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}