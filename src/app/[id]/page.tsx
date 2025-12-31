// src/app/[id]/page.tsx
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import RecipeDisplay from '@/components/RecipeDisplay';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/types/recipe';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChefHat } from 'lucide-react';
import ShareSocials from '@/components/ShareSocials'; // <--- Import atualizado

type RecipePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const docRef = doc(db, 'recipes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return { title: "Receita não encontrada | Refeita.AI" };
  }

  const data = docSnap.data();
  const recipeName = data.recipeTitle || "Receita Especial";

  return {
    title: `${recipeName} | Criado no Refeita.AI`,
    description: `Veja como fazer ${recipeName}. Receita gerada por inteligência artificial com base no que tinha na geladeira.`,
    openGraph: {
      title: recipeName,
      description: `Transformamos ingredientes simples nesta delícia. Confira!`,
      type: 'article',
    }
  };
}

export default async function RecipeDetailPage({ params }: RecipePageProps) {
  const { id } = await params;
  
  const docRef = doc(db, 'recipes', id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    notFound();
  }

  const data = docSnap.data();
  const recipeDetail: RecipeDetail = JSON.parse(data.recipeContent);

  // IMPORTANTE: Injetamos o ID e Likes para que o LikeButton interno funcione
  recipeDetail.id = id;
  recipeDetail.likes = data.likes || 0;

  return (
    // Fundo atualizado para a cor creme premium
    <main className="min-h-screen bg-[#fdfcf8] pb-20">
      
      {/* Header de Navegação */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-stone-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-orange-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Voltar ao Início</span>
          </Link>
          <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 uppercase tracking-wide">Comunidade</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        
        {/* Box de Contexto (Quem criou e com o quê) */}
        <div className="mb-8 p-6 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-stone-100">
            <div className="bg-stone-100 p-1.5 rounded-full">
              <ChefHat className="text-stone-600 w-4 h-4" />
            </div>
            <span className="text-stone-500 font-bold uppercase text-xs tracking-widest">
              Chef: {data.userName || 'Anônimo'}
            </span>
          </div>
          <h2 className="text-lg text-stone-800 leading-relaxed font-serif">
            Receita criada utilizando: <span className="font-bold text-orange-600">{data.ingredients}</span>
          </h2>
        </div>

        {/* Display da Receita (Agora com Like funcionando) */}
        <RecipeDisplay recipe={recipeDetail} index={1} />

        {/* Área de Compartilhamento Extra */}
        <div className="mt-10 flex flex-col items-center gap-4 py-8 border-t border-stone-200 border-dashed">
          <p className="text-stone-500 text-sm font-medium">
            Gostou do resultado? Envie para alguém!
          </p>
          {/* Componente Novo aqui */}
          <ShareSocials recipeName={recipeDetail.name} ingredients={recipeDetail.ingredients} />
        </div>

        {/* CTA Final (Visual Premium) */}
        <div className="mt-8 bg-stone-900 rounded-3xl p-10 text-center text-white shadow-xl shadow-stone-200">
          <h3 className="text-2xl font-serif font-bold mb-3 text-orange-50">Ficou com fome?</h3>
          <p className="text-stone-300 mb-8 max-w-md mx-auto leading-relaxed">
            Tire uma foto da sua geladeira agora e deixe nossa IA criar uma receita exclusiva para você.
          </p>
          <Link 
            href="/" 
            className="inline-block bg-orange-500 text-white font-bold py-4 px-10 rounded-full hover:bg-orange-600 hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            Criar Minha Receita 🚀
          </Link>
        </div>
      </div>
    </main>
  );
}