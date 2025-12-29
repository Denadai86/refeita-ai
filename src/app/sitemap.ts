import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://refeita-ai.acaoleve.com';

  // Páginas Estáticas (Sempre retornam, independente do banco)
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/sobre`, lastModified: new Date() },
    { url: `${baseUrl}/privacidade`, lastModified: new Date() },
    { url: `${baseUrl}/termos`, lastModified: new Date() },
  ];

  try {
    // 🟢 PROTEÇÃO: Se a chave da API estiver vazia no build, ele pula a parte do banco
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      return staticPages;
    }

    const q = query(
      collection(db, 'recipes'),
      where('isPublic', '==', true),
      limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    
    const recipePages = querySnapshot.docs.map((doc) => ({
      url: `${baseUrl}/${doc.id}`,
      lastModified: new Date(),
    }));

    return [...staticPages, ...recipePages];
  } catch (e) {
    console.warn("Sitemap: Banco de dados inacessível no build. Gerando apenas páginas estáticas.");
    return staticPages;
  }
}