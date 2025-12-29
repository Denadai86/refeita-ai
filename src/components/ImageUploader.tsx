// src/components/ImageUploader.tsx
'use client'

import React, { useCallback, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Camera, Image as ImageIcon, X, Loader2, UploadCloud } from 'lucide-react'

interface ImageUploaderProps {
  onImagesChange: (base64Images: string[]) => void
}

export function ImageUploader({ onImagesChange }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  
  // Refs para acionar os inputs ocultos
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  // Lógica central de processamento
  const processFiles = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return

    setIsCompressing(true)
    
    // Mantemos o estado atual e adicionamos novos (limite de 3 total)
    const currentCount = previews.length
    const availableSlots = 3 - currentCount
    
    if (availableSlots <= 0) {
      setIsCompressing(false)
      alert("Você já selecionou 3 imagens.")
      return
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots)
    const base64Results: string[] = []
    const newPreviews: string[] = []

    try {
      for (const file of filesToProcess) {
        // Opções otimizadas para Visão Computacional (Gemini)
        // Reduzimos para 0.5MB para evitar erro de Payload na Vercel
        const options = { 
          maxSizeMB: 0.5, 
          maxWidthOrHeight: 1024, 
          useWebWorker: true,
          initialQuality: 0.7
        }
        
        const compressedFile = await imageCompression(file, options)
        
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(compressedFile)
        })
        
        // Remove cabeçalho data:image... para enviar limpo à API
        base64Results.push(base64.split(',')[1])
        newPreviews.push(URL.createObjectURL(compressedFile))
      }

      // Atualiza previews locais
      setPreviews(prev => [...prev, ...newPreviews])
      
      // Envia para o componente pai (acumulando com o que já existia na lógica do pai, 
      // mas aqui estamos enviando apenas o delta ou o total? 
      // NOTA: O ideal é o pai gerenciar, mas vamos simplificar enviando o delta para callback 
      // ou recriando o array total se o pai não tiver estado. 
      // Assumindo que o pai espera o array TOTAL de base64 ativos:
      // (Neste caso simples, vamos disparar o callback com as NOVAS. 
      //  Se o pai precisasse de tudo, teríamos que guardar os base64 no state aqui também).
      //  AJUSTE: Para facilitar, vamos pedir que o usuário envie tudo de uma vez ou
      //  armazenar os base64 aqui no state. Vamos armazenar aqui para garantir consistência.
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
    } finally {
      setIsCompressing(false)
      // Reset inputs para permitir selecionar a mesma foto se quiser
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
    
    // Hack: Como não estamos guardando os base64 anteriores no state (apenas preview url),
    // e o componente pai espera a lista completa, nesta implementação simplificada
    // vamos disparar apenas as novas e deixar o pai lidar ou, melhor:
    // O ideal seria refatorar para guardar base64 no state. 
    // Vamos corrigir isso agora no processFiles para ser robusto.
  }

  // Wrapper para guardar base64 no state e emitir sempre a lista completa
  const [base64List, setBase64List] = useState<string[]>([])

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await processAndEmit(event.target.files)
    }
  }

  const processAndEmit = async (files: FileList | File[]) => {
    setIsCompressing(true)
    const availableSlots = 3 - base64List.length
    if (availableSlots <= 0) {
      setIsCompressing(false)
      return
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots)
    const newBase64s: string[] = []
    const newPreviews: string[] = []

    try {
      for (const file of filesToProcess) {
        const options = { 
          maxSizeMB: 0.5, 
          maxWidthOrHeight: 1024, 
          useWebWorker: true 
        }
        const compressed = await imageCompression(file, options)
        
        const b64 = await new Promise<string>((resolve) => {
          const r = new FileReader()
          r.onloadend = () => resolve(r.result as string)
          r.readAsDataURL(compressed)
        })

        newBase64s.push(b64.split(',')[1])
        newPreviews.push(URL.createObjectURL(compressed))
      }

      const updatedBase64List = [...base64List, ...newBase64s]
      const updatedPreviews = [...previews, ...newPreviews]

      setBase64List(updatedBase64List)
      setPreviews(updatedPreviews)
      onImagesChange(updatedBase64List)

    } catch (e) {
      console.error(e)
    } finally {
      setIsCompressing(false)
      if (cameraInputRef.current) cameraInputRef.current.value = ''
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newList = base64List.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    setBase64List(newList)
    setPreviews(newPreviews)
    onImagesChange(newList)
  }

  return (
    <div className="space-y-4">
      {/* Inputs Ocultos */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment" // O segredo para abrir câmera direto no mobile
        className="hidden"
        onChange={handleFiles}
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* Área de Controle Principal */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
        
        {isCompressing ? (
          <div className="flex flex-col items-center justify-center py-4 gap-3">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            <span className="text-sm font-medium text-gray-600">Otimizando imagens...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="flex justify-center text-green-600 mb-2">
                <UploadCloud className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Adicione fotos dos ingredientes
              </p>
              <p className="text-xs text-gray-500">
                (Máximo 3 fotos • Nós identificamos os itens)
              </p>
            </div>

            {/* Botões de Ação - Mobile Friendly */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={previews.length >= 3}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm active:scale-95 transition-all hover:border-green-400 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-6 h-6" />
                <span className="text-xs font-semibold">Câmera</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={previews.length >= 3}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-white border border-gray-200 rounded-lg shadow-sm active:scale-95 transition-all hover:border-blue-400 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs font-semibold">Galeria</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid de Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2">
          {previews.map((src, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
              <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
              
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg active:scale-90 transition-transform"
                title="Remover foto"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}