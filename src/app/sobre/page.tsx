import Link from 'next/link';
import { ChefHat, Sparkles, Heart } from 'lucide-react';

export default function SobrePage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6">
      <div className="text-center mb-12">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ChefHat className="text-green-600 w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">Sobre o Refeita.AI</h1>
        <p className="text-xl text-gray-600 italic">"Transformando sobras em sorrisos."</p>
      </div>

      <div className="prose prose-lg text-gray-700 space-y-6">
        <p>
          O <strong>Refeita.AI</strong> nasceu de um dilema comum em milhões de lares brasileiros: o que cozinhar com o que restou na geladeira? 
        </p>
        <p>
          Nossa missão é combater o desperdício de alimentos usando a tecnologia mais avançada do mundo. Através da inteligência artificial do Google Gemini, permitimos que qualquer pessoa — desde a dona de casa experiente até o solteiro que acabou de se mudar — crie pratos dignos de chef em segundos.
        </p>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 my-10">
          <h3 className="flex items-center gap-2 text-green-700 font-bold mb-4">
            <Sparkles className="w-5 h-5" /> Por que usamos IA?
          </h3>
          <p className="text-sm leading-relaxed">
            A culinária é uma arte de combinações. Nossa IA analisa seus ingredientes e sugere técnicas que harmonizam sabores, economizam gás/energia e, acima de tudo, evitam que comida boa vá para o lixo.
          </p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Nosso Compromisso</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Acessibilidade:</strong> Ferramentas gratuitas para ajudar no dia a dia.</li>
          <li><strong>Sustentabilidade:</strong> Foco total em desperdício zero.</li>
          <li><strong>Comunidade:</strong> Um feed público para inspirar outras pessoas a cozinharem em casa.</li>
        </ul>
      </div>

      <div className="mt-16 text-center border-t pt-10">
        <p className="flex items-center justify-center gap-2 text-gray-500 mb-6">
          Feito com <Heart className="w-4 h-4 text-red-500 fill-current" /> pela equipe Ação Leve.
        </p>
        <Link href="/" className="text-green-600 font-bold hover:underline">
          ← Voltar para a Cozinha
        </Link>
      </div>
    </main>
  );
}