// src/hooks/useDailyLimit.ts
'use client'

import { useState, useEffect } from 'react'

const MAX_DAILY_FREE = 1 // Limite de receitas grátis
const STORAGE_KEY = 'refeita_daily_usage'

export function useDailyLimit() {
  const [remaining, setRemaining] = useState(MAX_DAILY_FREE)
  const [hasReachedLimit, setHasReachedLimit] = useState(false)

  // Ao carregar, verifica o armazenamento local
  useEffect(() => {
    checkLimit()
  }, [])

  const checkLimit = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()

    if (stored) {
      const data = JSON.parse(stored)
      
      // Se for um novo dia, reinicia o contador
      if (data.date !== today) {
        resetLimit(today)
      } else {
        // Se for o mesmo dia, calcula o restante
        const left = MAX_DAILY_FREE - data.count
        setRemaining(left > 0 ? left : 0)
        setHasReachedLimit(data.count >= MAX_DAILY_FREE)
      }
    } else {
      // Primeira vez a usar
      resetLimit(today)
    }
  }

  const resetLimit = (dateStr: string) => {
    const data = { date: dateStr, count: 0 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    setRemaining(MAX_DAILY_FREE)
    setHasReachedLimit(false)
  }

  const incrementUsage = () => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const today = new Date().toDateString()
    let currentCount = 0

    if (stored) {
      const data = JSON.parse(stored)
      currentCount = data.count
    }

    const newCount = currentCount + 1
    const newData = { date: today, count: newCount }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
    setRemaining(MAX_DAILY_FREE - newCount > 0 ? MAX_DAILY_FREE - newCount : 0)
    setHasReachedLimit(newCount >= MAX_DAILY_FREE)
  }

  return { 
    remaining, 
    hasReachedLimit, 
    incrementUsage,
    limit: MAX_DAILY_FREE 
  }
}