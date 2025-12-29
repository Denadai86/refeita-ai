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
  const [cuisine, setCuisine] = useState('') // Agora inicia vazio para o input
  
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
    if (ingredients.trim() === NO_INGREDIENTS_MSG || !ingredients.trim()) {
      alert("Por favor, adicione ingredientes.")
      return
    }
    
    onSubmit({
      ingredients,
      restrictions,
      maxTime: prepTime,
      cuisinePreference: cuisine || "Qualquer" // Fallback se deixar vazio
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Seção de Câmera */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Identificar pela Câmera
        </label>
        <ImageUploader onImagesChange={handleImagesChange} />
        {isIdentifying && (
          <div className="mt-3 flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-2 rounded-lg animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" /> Analisando fotos...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Ingredientes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ingredientes</label>
          <textarea
            required
            rows={3}
            className={`w-full rounded-xl border p-3 text-base outline-none transition-all ${
              visionError ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100'
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
          {/* Tempo de Preparo (Mantido Select por ser métrica técnica) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Tempo Máximo
            </label>
            <select 
              className="w-full rounded-xl border border-gray-200 p-3 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            >
              <option>Super Rápido (até 15min)</option>
              <option>Rápido (até 30min)</option>
              <option>Normal (30-60min)</option>
              <option>Qualquer</option>
            </select>
          </div>

          {/* Tipo de Culinária (Agora como Input Aberto) */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Utensils className="w-4 h-4" /> Estilo de Culinária
            </label>
            <input 
              type="text"
              className="w-full rounded-xl border border-gray-200 p-3 bg-white outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Ex: Italiana, Saudável, Comida de Vó..."
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            />
          </div>
        </div>

        {/* Restrições */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Restrições Alimentares</label>
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
            placeholder="Ex: Sem glúten, Vegano, Sem lactose..."
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isIdentifying || ingredients === NO_INGREDIENTS_MSG}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-lg active:scale-[0.98]"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChefHat className="w-6 h-6" />}
          {isLoading ? "O Chef está cozinhando..." : "Gerar Receitas"}
        </button>
      </form>
    </div>
  )
}