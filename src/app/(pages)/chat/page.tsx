// src/app/(pages)/chat/page.tsx
import { generateRecipeAction } from '@/app/actions'
import ChatInterface from '@/components/ChatInterface'

export const dynamic = 'force-dynamic'

export default function ChatPage() {
  return (
    <ChatInterface action={generateRecipeAction} />
  )
}