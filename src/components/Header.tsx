// src/components/Header.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        {/* ⚡ CORREÇÃO DO LOGO: Usa o caminho raiz (/) para acessar o /public/logo.png */}
        <Link href="/" className="flex items-center space-x-2">
            <Image
                src="/logo.png" // Caminho correto para /public/logo.png
                alt="Refeita.AI Logo"
                width={32}
                height={32}
                className="w-8 h-8"
            />
            <span className="text-xl font-extrabold text-red-600">
                Refeita.AI
            </span>
        </Link>

        {/* Aqui você colocaria botões de Login ou um menu */}
        <nav className="space-x-4">
            {/* Futuramente: <AuthButton /> */}
        </nav>

      </div>
    </header>
  );
}