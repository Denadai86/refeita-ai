// src/components/RecipeFeed.tsx
'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { RecipeDetail } from '@/types/recipe'
import RecipeDisplay from './RecipeDisplay'
import { Loader2, Users, UtensilsCrossed } from 'lucide-react'

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
    async function loadFeed() {
      try {
        setLoading(true)
        const q = query(
          collection(db, 'recipes'),
          where('isPublic', '==', true),
          orderBy('createdAt', 'desc'),
          limit(12)
        )

        const querySnapshot = await getDocs(q)
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SavedRecipe[]
        
        setRecipes(items)
      } catch (error) {
        console.error("Erro ao carregar feed:", error)
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
        <p className="text-gray-500 animate-pulse">Carregando inspirações...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-3">
          <Users className="text-green-600" /> Comunidade Refeita
        </h2>
        <p className="text-gray-500">Descubra o que outros chefs estão criando com a nossa IA</p>
      </div>

      {recipes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Ainda não temos receitas públicas. Seja o primeiro a compartilhar!</p>
        </div>
      ) : (
        <div className="grid gap-12">
          {recipes.map((item) => {
            // Tentativa segura de parse do JSON
            let recipeData: RecipeDetail
            try {
              recipeData = JSON.parse(item.recipeContent)
            } catch (e) {
              return null
            }

            return (
              <div key={item.id} className="relative group">
                <div className="absolute -top-4 left-6 z-10 bg-green-600 text-white px-4 py-1.5 rounded-full shadow-lg text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Chef: {item.userName}
                </div>
                <RecipeDisplay recipe={recipeData} index={0} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}