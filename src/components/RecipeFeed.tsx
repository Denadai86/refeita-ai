// src/components/RecipeFeed.tsx
'use client'

import { useEffect, useState, useMemo } from 'react'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { RecipeDetail } from '@/types/recipe'
import RecipeDisplay from './RecipeDisplay'
import { Loader2, Users, UtensilsCrossed, Search, ChefHat, TrendingUp, Clock } from 'lucide-react'

interface SavedRecipe {
  id: string
  userName: string
  recipeContent: string
  parsedContent?: RecipeDetail
  createdAt: any
  likes: number
}

export default function RecipeFeed() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Estado para controlar a ordenação
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')

  useEffect(() => {
    async function loadFeed() {
      try {
        setLoading(true)
        
        // Define o campo de ordenação base
        // Se for popular, ordena por likes. Se for recente, por data.
        const orderField = sortBy === 'popular' ? 'likes' : 'createdAt'

        // 1. Buscamos 50 para ter margem de sobra para remover duplicatas no cliente
        const q = query(
          collection(db, 'recipes'),
          where('isPublic', '==', true),
          orderBy(orderField, 'desc'),
          limit(50) 
        )

        const querySnapshot = await getDocs(q)
        
        // 2. Processamento e Deduplicação
        const uniqueTitles = new Set<string>()
        const cleanRecipes: SavedRecipe[] = []

        querySnapshot.forEach((doc) => {
          const data = doc.data()
          try {
            const parsed = JSON.parse(data.recipeContent) as RecipeDetail
            
            // Injeta ID e Likes para o componente filho usar
            parsed.id = doc.id
            parsed.likes = data.likes || 0

            // Normaliza título para evitar duplicatas (ex: "Bolo" e "bolo")
            const normalizedTitle = parsed.name?.toLowerCase().trim()
            
            if (normalizedTitle && !uniqueTitles.has(normalizedTitle)) {
              uniqueTitles.add(normalizedTitle)
              cleanRecipes.push({
                id: doc.id,
                userName: data.userName,
                recipeContent: data.recipeContent,
                parsedContent: parsed,
                createdAt: data.createdAt,
                likes: data.likes || 0
              })
            }
          } catch (e) {
            console.warn("Receita ignorada:", doc.id)
          }
        })

        // 3. Cortamos para o Top 10 Únicos
        setRecipes(cleanRecipes.slice(0, 10))
        
      } catch (error) {
        console.error("Erro ao carregar feed:", error)
        // Lembrete: Se der erro no console, clique no link do Firebase para criar o índice composto!
      } finally {
        setLoading(false)
      }
    }

    loadFeed()
  }, [sortBy]) // Recarrega sempre que mudar a ordenação

  // 4. Filtro de Busca (Memória)
  const filteredRecipes = useMemo(() => {
    if (!searchTerm) return recipes;
    
    const lowerTerm = searchTerm.toLowerCase();
    
    return recipes.filter(item => {
      const recipe = item.parsedContent;
      if (!recipe) return false;

      return (
        recipe.name.toLowerCase().includes(lowerTerm) || 
        recipe.ingredients.some(ing => ing.toLowerCase().includes(lowerTerm))
      );
    });
  }, [recipes, searchTerm]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Cabeçalho */}
      <div className="text-center space-y-4 mb-4">
        <h2 className="text-4xl font-serif font-bold text-stone-800 flex items-center justify-center gap-3">
          <Users className="text-orange-500 w-8 h-8" /> 
          Comunidade
        </h2>
        <p className="text-stone-500 max-w-md mx-auto">
          Inspire-se com receitas únicas criadas por outros chefs usando IA.
        </p>
      </div>

      {/* Controles: Busca e Ordenação */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between max-w-lg mx-auto md:max-w-3xl mb-8">
        
        {/* Barra de Busca */}
        <div className="relative flex-grow w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-stone-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all shadow-sm text-stone-700 placeholder-stone-400"
            placeholder="Buscar por nome ou ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Botões de Ordenação (Pills) */}
        <div className="flex bg-white p-1 rounded-full border border-stone-200 shadow-sm shrink-0">
            <button
                onClick={() => setSortBy('recent')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    sortBy === 'recent' 
                    ? 'bg-stone-800 text-white shadow-md' 
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
            >
                <Clock className="w-4 h-4" /> Recentes
            </button>
            <button
                onClick={() => setSortBy('popular')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    sortBy === 'popular' 
                    ? 'bg-orange-500 text-white shadow-md' 
                    : 'text-stone-500 hover:bg-stone-100'
                }`}
            >
                <TrendingUp className="w-4 h-4" /> Populares
            </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          <p className="text-stone-500 font-serif italic">Buscando os melhores pratos...</p>
        </div>
      ) : (
        /* Lista de Resultados */
        filteredRecipes.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-stone-100 shadow-sm">
            <UtensilsCrossed className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 text-lg">
              {searchTerm 
                ? `Nenhuma receita encontrada com "${searchTerm}"` 
                : "Ainda não temos receitas públicas. Seja o primeiro a compartilhar!"}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredRecipes.map((item) => (
              <div key={item.id} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Badge do Usuário */}
                <div className="absolute -top-3 left-6 z-10 bg-stone-800 text-white px-4 py-1.5 rounded-full shadow-lg text-xs font-bold tracking-wider flex items-center gap-2 border border-stone-600">
                  <ChefHat className="w-3 h-3 text-orange-400" />
                  CHEF {item.userName.toUpperCase().split(' ')[0]}
                </div>
                
                {/* Card da Receita */}
                <RecipeDisplay recipe={item.parsedContent!} index={0} />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}