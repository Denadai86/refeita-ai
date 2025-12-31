// src/components/RecipeForm.tsx
'use client'

import React, { useState, useTransition } from 'react'
import { ImageUploader } from './ImageUploader'
import { identifyIngredientsAction } from '@/actions/recipe'
import { Loader2, ChefHat, Sparkles, AlertCircle, Clock, Utensils } from 'lucide-react'
import { NO_INGREDIENTS_MSG } from '@/lib/llm'

interface RecipeFormProps {
  onSubmit: (data: {
    ingredients: string
    restrictions: string
    maxTime: string
    cuisinePreference: string
  }) => void
  isLoading: boolean
}

export default function RecipeForm({ onSubmit, isLoading }: RecipeFormProps) {
  const [ingredients, setIngredients] = useState('')
  const [restrictions, setRestrictions] = useState('')
  const [prepTime, setPrepTime] = useState('Rápido (até 30min)')
  const [cuisine, setCuisine] = useState('') 
  
  const [isIdentifying, startIdentifying] = useTransition()
  const [visionError, setVisionError] = useState(false)

  const handleImagesChange = async (base64Images: string[]) => {
    if (ingredients === NO_INGREDIENTS_MSG) {
      setIngredients('')
      setVisionError(false)
    }

    if (base64Images.length === 0) return

    startIdentifying(async () => {
      try {
        setVisionError(false)
        const result = await identifyIngredientsAction(base64Images)
        
        if (!result.success) return

        const detectedText = result.ingredients || ''

        if (detectedText === NO_INGREDIENTS_MSG) {
          setVisionError(true)
          setIngredients(NO_INGREDIENTS_MSG)
        } else {
          setIngredients(prev => {
            if (!prev || prev === NO_INGREDIENTS_MSG) return detectedText
            return `${prev.trim()}, ${detectedText.trim()}`
          })
        }
      } catch (error) {
        console.error("Erro na visão:", error)
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação principal: Só ingredientes são obrigatórios
    if (ingredients.trim() === NO_INGREDIENTS_MSG || !ingredients.trim()) {
      alert("Por favor, adicione ingredientes ou tire uma foto.")
      return
    }
    
    onSubmit({
      ingredients,
      restrictions,
      maxTime: prepTime,
      // Se estiver vazio, manda "Qualquer"
      cuisinePreference: cuisine.trim() || "Qualquer" 
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Seção de Câmera */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <label className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-500" />
          Identificar pela Câmera
        </label>
        <ImageUploader onImagesChange={handleImagesChange} />
        {isIdentifying && (
          <div className="mt-3 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Analisando fotos...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ingredientes - OBRIGATÓRIO (required) */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Ingredientes</label>
          <textarea
            required
            rows={3}
            className={`w-full rounded-xl border p-3 text-base outline-none transition-all ${
              visionError ? 'border-red-300 bg-red-50 text-red-700' : 'border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100'
            }`}
            placeholder="Ex: Frango, batata, cebola..."
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value)
              if (visionError) setVisionError(false)
            }}
          />
          {visionError && (
            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Não identificamos comida na foto.
            </p>
          )}
        </div>

        {/* Grid de Preferências */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tempo - Select sempre tem valor, então ok */}
          <div>
            <label className="text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Tempo Máximo
            </label>
            <select 
              className="w-full rounded-xl border border-stone-200 p-3 bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 text-stone-600"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            >
              <option>Super Rápido (até 15min)</option>
              <option>Rápido (até 30min)</option>
              <option>Normal (30-60min)</option>
              <option>Qualquer</option>
            </select>
          </div>

          {/* Culinária - REMOVIDO O 'REQUIRED' AQUI */}
          <div>
            <label className="text-sm font-bold text-stone-700 mb-1 flex items-center gap-2">
              <Utensils className="w-4 h-4" /> Estilo (Opcional)
            </label>
            <input 
              type="text"
              // required <--- ISSO FOI REMOVIDO
              className="w-full rounded-xl border border-stone-200 p-3 bg-white outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
              placeholder="Ex: Italiana, Fit, Vó..."
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            />
          </div>
        </div>

        {/* Restrições - Opcional por padrão */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1">Restrições Alimentares</label>
          <input
            type="text"
            className="w-full rounded-xl border border-stone-200 p-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 placeholder-stone-400"
            placeholder="Ex: Sem glúten, Vegano..."
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isIdentifying || ingredients === NO_INGREDIENTS_MSG}
          className="w-full bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChefHat className="w-6 h-6" />}
          {isLoading ? "O Chef está cozinhando..." : "Gerar Receitas"}
        </button>
      </form>
    </div>
  )
}