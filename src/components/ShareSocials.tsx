// src/components/ShareSocials.tsx
'use client'

import { useState } from 'react'
import { MessageCircle, Instagram, Check, Copy } from 'lucide-react'

interface ShareSocialsProps {
  recipeName: string
  ingredients: string[]
}

export default function ShareSocials({ recipeName, ingredients }: ShareSocialsProps) {
  const [copied, setCopied] = useState(false)

  const baseUrl = "https://refeita-ai.acaoleve.com" // Seu domínio
  
  // Texto formatado para compartilhamento
  const shareText = `🍳 Confira essa receita de "${recipeName}" que fiz com ${ingredients.slice(0, 3).join(', ')}... usando o Refeita AI!\n\nVeja aqui: ${baseUrl}`

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  const handleInstagramCopy = () => {
    // Como o Instagram não aceita link direto com texto, copiamos para o clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 3000) // Reset após 3s
    })
  }

  return (
    <div className="flex items-center gap-2">
      {/* Botão WhatsApp */}
      <button
        onClick={handleWhatsApp}
        className="p-2 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full transition-all shadow-sm active:scale-95"
        title="Enviar no WhatsApp"
      >
        <MessageCircle className="w-5 h-5" />
      </button>

      {/* Botão Instagram (Copy) */}
      <div className="relative group">
        <button
          onClick={handleInstagramCopy}
          className={`p-2 rounded-full transition-all shadow-sm active:scale-95 text-white ${
            copied ? 'bg-stone-800' : 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]'
          }`}
          title="Copiar legenda para Instagram"
        >
          {copied ? <Check className="w-5 h-5" /> : <Instagram className="w-5 h-5" />}
        </button>
        
        {/* Tooltip de Feedback */}
        {copied && (
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-1">
            Copiado! Cole no Insta
          </span>
        )}
      </div>
    </div>
  )
}