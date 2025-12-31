// src/app/(main)/page.tsx
import RecipeGenerator from '@/components/RecipeGenerator';


export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-10">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            Refeita <span className="text-green-600">AI</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Transforme o que você tem na geladeira em pratos incríveis usando inteligência artificial.
          </p>
        </div>

        {/* O RecipeGenerator agora centraliza toda a lógica de Form e Display */}
        <RecipeGenerator />
      </div>
    </main>
  );
}