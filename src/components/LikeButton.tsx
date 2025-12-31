'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Heart } from 'lucide-react'
import { toggleRecipeLike } from '@/lib/firestore-service'

interface LikeButtonProps {
  recipeId: string
  initialLikes?: number
}

export default function LikeButton({ recipeId, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [isLiked, setIsLiked] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Verifica se já deu like no navegador
    const key = `liked_${recipeId}`
    if (localStorage.getItem(key)) setIsLiked(true)
  }, [recipeId])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evita abrir/fechar o card ao clicar no like
    
    const newIsLiked = !isLiked
    setIsLiked(newIsLiked)
    setLikes(prev => newIsLiked ? prev + 1 : prev - 1)
    setIsAnimating(true)

    if (newIsLiked) localStorage.setItem(`liked_${recipeId}`, 'true')
    else localStorage.removeItem(`liked_${recipeId}`)

    setTimeout(() => setIsAnimating(false), 300)

    try {
      await toggleRecipeLike(recipeId, newIsLiked)
    } catch (error) {
      console.error(error)
      // Rollback silencioso em caso de erro
      setIsLiked(!newIsLiked)
      setLikes(prev => newIsLiked ? prev - 1 : prev + 1)
    }
  }

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-2 group transition-all active:scale-95 z-20"
      title={isLiked ? "Descurtir" : "Curtir receita"}
    >
      <div className={`p-2 rounded-full transition-all duration-300 shadow-sm border ${
        isLiked 
          ? 'bg-orange-100 border-orange-200' 
          : 'bg-white border-stone-200 group-hover:border-orange-200'
      }`}>
        <ChefHat 
          className={`w-5 h-5 transition-all duration-300 ${
            isLiked 
              ? 'text-orange-500 fill-orange-500 rotate-12' 
              : 'text-stone-400 group-hover:text-orange-400'
          } ${isAnimating ? 'animate-bounce' : ''}`} 
        />
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className={`text-sm font-bold ${isLiked ? 'text-orange-600' : 'text-stone-600'}`}>
          {likes}
        </span>
        <span className="text-[9px] text-stone-400 uppercase font-bold tracking-wider">
          Aprovações
        </span>
      </div>
    </button>
  )
}