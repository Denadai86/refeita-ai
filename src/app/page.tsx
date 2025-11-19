// Refeita.AI/src/app/page.tsx
import RecipeForm from '@/components/RecipeForm';
import { Metadata } from 'next';
// Não precisamos importar Image, pois o boilerplate foi removido.

// ----------------------------------------------------
// 1. Metadata (SEO)
// ----------------------------------------------------
export const metadata: Metadata = {
  title: 'Refeita.AI | Gerador de Receitas por Sobras',
  description: 'Crie receitas deliciosas e criativas com o que você já tem na geladeira, usando inteligência artificial.',
  keywords: ['receitas', 'inteligência artificial', 'desperdício zero', 'Refeita.AI'],
};

// ----------------------------------------------------
// 2. Server Component Principal
// ----------------------------------------------------
export default function HomePage() {
  return (
    // Usa classes Tailwind para centralizar o formulário e dar um fundo suave
    <div className="min-h-screen bg-gray-50 py-12">
      <RecipeForm />
    </div>
  );
}