// src/app/[id]/page.tsx (Layout do Lote)

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import RecipeDisplay from '@/components/RecipeDisplay';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RecipeDetail } from '@/types/recipe';
import Link from 'next/link';
import { ArrowLeft, Sparkles, ChefHat } from 'lucide-react';
import  ShareWhatsApp  from '@/components/ShareWhatsApp';

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
    description: `Veja como fazer ${recipeName} usando ${data.ingredients}. Receita gerada por IA.`,
    openGraph: {
      title: recipeName,
      description: `Transformamos ${data.ingredients} nesta delícia. Confira!`,
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

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-tighter">Comunidade</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-10">
        <div className="mb-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
          <div className="flex items-center gap-3 mb-2">
            <ChefHat className="text-indigo-600 w-5 h-5" />
            <span className="text-indigo-900 font-bold uppercase text-xs tracking-widest">
              Inspirado por {data.userName || 'um Chef Anônimo'}
            </span>
          </div>
          <h2 className="text-lg text-indigo-900 leading-relaxed">
            Criada a partir de: <span className="font-bold underline decoration-indigo-300">{data.ingredients}</span>
          </h2>
        </div>

        <RecipeDisplay recipe={recipeDetail} index={1} />

        <div className="mt-8 flex flex-col items-center gap-6">
          <ShareWhatsApp recipeName={recipeDetail.name} recipeId={id} />
          <p className="text-gray-400 text-xs italic">
            Compartilhe esta ideia com seus amigos e família!
          </p>
        </div>

        <div className="mt-12 bg-green-600 rounded-3xl p-10 text-center text-white shadow-xl shadow-green-200">
          <h3 className="text-2xl font-black mb-2">Gostou dessa sugestão?</h3>
          <p className="text-green-100 mb-8 max-w-md mx-auto">
            Tire uma foto da sua geladeira e deixe nossa IA criar algo único para você também!
          </p>
          <Link 
            href="/" 
            className="inline-block bg-white text-green-700 font-extrabold py-4 px-10 rounded-full hover:scale-105 transition-transform shadow-lg"
          >
            Criar Minha Própria Receita 🚀
          </Link>
        </div>
      </div>
    </main>
  );
}