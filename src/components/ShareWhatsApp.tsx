// src/components/ShareWhatsApp.tsx
'use client'

import { MessageCircle } from 'lucide-react'

interface ShareWhatsAppProps {
  recipeName: string
  recipeId?: string // Opcional para quando tivermos página de detalhe
}

export default function ShareWhatsApp({ recipeName, recipeId }: ShareWhatsAppProps) {
  const handleShare = () => {
    // URL base do seu SaaS
    const baseUrl = "https://refeita-ai.acaoleve.com"
    const shareUrl = recipeId ? `${baseUrl}/${recipeId}` : baseUrl
    
    const message = encodeURIComponent(
      `🍳 Olhe essa receita de "${recipeName}" que acabei de criar na Refeita AI! \n\nConfira aqui: ${shareUrl}`
    )
    
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full text-sm font-bold transition-all shadow-md active:scale-95"
    >
      <MessageCircle className="w-4 h-4 fill-white" />
      Compartilhar no WhatsApp
    </button>
  )
}