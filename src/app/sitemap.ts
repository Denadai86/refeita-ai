import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://refeita-ai.acaoleve.com';

  // 1. Páginas Estáticas
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/sobre`, lastModified: new Date() },
    { url: `${baseUrl}/privacidade`, lastModified: new Date() },
    { url: `${baseUrl}/termos`, lastModified: new Date() },
  ];

  // 2. Páginas Dinâmicas (Receitas do Feed)
  // Pegamos as últimas 100 para não estourar o limite de build da Vercel
  let recipePages: any[] = [];
  try {
    const q = query(
      collection(db, 'recipes'),
      where('isPublic', '==', true),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    
    recipePages = querySnapshot.docs.map((doc) => ({
      url: `${baseUrl}/${doc.id}`,
      lastModified: new Date(),
    }));
  } catch (e) {
    console.error("Erro ao gerar sitemap dinâmico:", e);
  }

  return [...staticPages, ...recipePages];
}