import RecipeClientWrapper from '@/components/RecipeClientWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refeita.AI | Gerador de Receitas por Sobras',
  description: 'Crie receitas deliciosas com o que você já tem usando IA.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <RecipeClientWrapper />
    </div>
  );
}
