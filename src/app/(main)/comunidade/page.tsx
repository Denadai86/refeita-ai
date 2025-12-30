// src/app/(main)/comunidade/page.tsx
import RecipeFeed from '@/components/RecipeFeed';

export default function ComunidadePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        <RecipeFeed />
      </div>
    </main>
  );
}