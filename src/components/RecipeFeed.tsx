// src/components/RecipeFeed.tsx
'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { RecipeDetail } from '@/types/recipe'
import RecipeDisplay from './RecipeDisplay'
import { Loader2, Users } from 'lucide-react'

interface SavedRecipe {
  id: string
  recipeTitle: string
  recipeContent: string
  userName: string
  createdAt: any
}

export default function RecipeFeed() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Query: Receitas públicas, ordenadas pelas mais recentes
    const q = query(
      collection(db, 'recipes'),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const feedItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SavedRecipe[]
      
      setRecipes(feedItems)
      setLoading(false)
    }, (error) => {
      console.error("Erro no Feed:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
        <div className="p-2 bg-green-100 rounded-lg text-green-600">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Feed da Comunidade</h2>
          <p className="text-sm text-gray-500">Veja o que outros chefs estão criando</p>
        </div>
      </div>

      <div className="grid gap-8">
        {recipes.map((item) => {
          const recipeData = JSON.parse(item.recipeContent) as RecipeDetail
          return (
            <div key={item.id} className="relative group">
              <div className="absolute -top-3 left-4 z-10 bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm text-xs font-medium text-gray-600">
                👤 Criado por <span className="text-green-600 font-bold">{item.userName}</span>
              </div>
              <RecipeDisplay recipe={recipeData} index={0} />
            </div>
          )
        })}
      </div>
    </div>
  )
}