// src/components/ImageUploader.tsx

'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import imageCompression from 'browser-image-compression'
import { Camera, X, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  onImagesChange: (base64Images: string[]) => void
}

export function ImageUploader({ onImagesChange }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsCompressing(true)
    const base64Results: string[] = []
    const newPreviews: string[] = []

    try {
      for (const file of acceptedFiles) {
        // 1. Comprime a imagem (máximo 1MB e 1024px)
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1024, useWebWorker: true }
        const compressedFile = await imageCompression(file, options)
        
        // 2. Converte para Base64 para enviar via Server Action
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(compressedFile)
        })
        
        // Limpamos o prefixo "data:image/jpeg;base64," para a API do Gemini
        base64Results.push(base64.split(',')[1])
        newPreviews.push(URL.createObjectURL(compressedFile))
      }

      setPreviews(prev => [...prev, ...newPreviews].slice(0, 3))
      onImagesChange(base64Results.slice(0, 3))
    } catch (error) {
      console.error('Erro ao processar imagem:', error)
    } finally {
      setIsCompressing(false)
    }
  }, [onImagesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 3
  })

  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
        <input {...getInputProps()} />
        {isCompressing ? (
          <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin text-green-600" /> <span className="text-xs">Otimizando...</span></div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Camera className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">Tire fotos da geladeira ou armário</p>
            <p className="text-xs text-gray-400">(Até 3 fotos simultâneas)</p>
          </div>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
              <img src={src} className="w-full h-full object-cover" />
              <button onClick={() => setPreviews(p => p.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}