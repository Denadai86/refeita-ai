// src/lib/firestore-service.ts
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';

export interface SavedRecipe {
  id?: string;
  userId: string | 'anonymous';
  userName?: string; // Salvar apenas primeiro nome ou apelido
  ingredients: string;
  recipeTitle: string;
  recipeContent: string; // JSON ou HTML string
  isPublic: boolean;
  createdAt: any;
  likes: number;
}

const RECIPES_COLLECTION = 'recipes';

// Salvar Receita
export async function saveRecipe(data: Omit<SavedRecipe, 'id' | 'createdAt' | 'likes'>) {
  try {
    const docRef = await addDoc(collection(db, RECIPES_COLLECTION), {
      ...data,
      createdAt: serverTimestamp(),
      likes: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error("Erro ao salvar receita:", error);
    throw error;
  }
}

// Buscar Feed Público
export async function getPublicFeed(max = 9) {
  try {
    const q = query(
      collection(db, RECIPES_COLLECTION),
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
      limit(max)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedRecipe[];
  } catch (error) {
    console.error("Erro ao buscar feed:", error);
    return [];
  }
}