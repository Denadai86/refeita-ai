// src/components/Header.tsx
'use client'

import Link from 'next/link'
import { ChefHat, Users, PlusCircle, LogOut, User as UserIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

export default function Header() {
  const pathname = usePathname()
  const { user, logout, login } = useAuth()

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-orange-500 p-1.5 rounded-xl group-hover:rotate-12 transition-transform">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-serif font-bold text-stone-800">
            Refeita<span className="text-orange-500">.AI</span>
          </span>
        </Link>

        {/* Navegação Central (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <Link 
            href="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              pathname === '/' ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Criar Receita
          </Link>

          <Link 
            href="/comunidade" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              pathname === '/comunidade' ? 'bg-orange-100 text-orange-700' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Users className="w-4 h-4" />
            Comunidade
          </Link>
        </nav>

        {/* Área do Usuário / Login */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-bold text-stone-800 line-clamp-1">
                  {user.displayName?.split(' ')[0]}
                </span>
                <button 
                  onClick={logout}
                  className="text-[10px] text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors uppercase font-bold tracking-tighter"
                >
                  Sair <LogOut className="w-2 h-2" />
                </button>
              </div>
              
              {user.photoURL ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm">
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || 'Usuário'} 
                    fill 
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={login}
              className="bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-lg shadow-stone-200"
            >
              Entrar
            </button>
          )}
        </div>
      </div>

      {/* Navegação Mobile (Abaixo do Header principal em telas pequenas) */}
      <nav className="md:hidden flex items-center justify-center gap-4 py-2 border-t border-stone-50 bg-stone-50/50">
          <Link href="/" className={`text-xs font-bold ${pathname === '/' ? 'text-orange-600' : 'text-stone-400'}`}>CRIAR</Link>
          <Link href="/comunidade" className={`text-xs font-bold ${pathname === '/comunidade' ? 'text-orange-600' : 'text-stone-400'}`}>COMUNIDADE</Link>
      </nav>
    </header>
  )
}