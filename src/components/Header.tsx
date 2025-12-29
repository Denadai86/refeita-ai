'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, Sparkles } from 'lucide-react';

export default function Header() {
  const { user, login, logout } = useAuth();
  const logoSrc = "/android-chrome-512x512.png"; 

  return (
    <header className="bg-green-600 text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-20 flex justify-between items-center">
        
        {/* LADO ESQUERDO: LOGO E TITULO */}
        <Link href="/" className="flex items-center gap-3 group">
          <img
            src={logoSrc} 
            alt="Refeita.AI Logo"
            className="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:scale-110 transition-transform"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-black tracking-tighter uppercase">
              Refeita.AI
            </span>
            <span className="text-[10px] text-green-100 font-bold tracking-widest uppercase">
              Smart Kitchen
            </span>
          </div>
        </Link>

        {/* LADO DIREITO: ÁREA DO USUÁRIO */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3 bg-green-700/40 p-1.5 pr-3 rounded-full border border-white/20 backdrop-blur-sm">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-white/50 shadow-sm" />
              ) : (
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
              )}
              <div className="flex flex-col">
                <span className="hidden sm:block text-[10px] text-green-200 font-bold uppercase">Mestre Cuca</span>
                <span className="hidden sm:block text-xs font-bold leading-none">
                  {user.displayName?.split(' ')[0]}
                </span>
              </div>
              <button 
                onClick={logout}
                className="ml-2 hover:bg-red-500 p-1.5 rounded-full transition-all text-white/80 hover:text-white"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 bg-white text-green-700 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-tight hover:bg-green-50 transition-all shadow-lg active:scale-95"
            >
              <UserIcon size={14} />
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}