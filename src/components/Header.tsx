// src/components/Header.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  // A URL de acesso ao seu site: refeita-ai.acaoleve.com (image_9ececb.png)

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        <Link href="/" className="flex items-center space-x-2">
            {/* ⚡ CORREÇÃO DO LOGO: Definimos o width/height explicitamente */}
            <Image
                // Verifique na sua pasta public: se o arquivo é 'logo.png', mantenha '/logo.png'.
                // Se você quiser usar o 'file.svg' que aparece na pasta, use:
                src="/file.svg" // Tentando o SVG, que é um ativo comum. Se for PNG, mantenha /logo.png
                alt="Refeita.AI Logo"
                width={32} // Obrigatório
                height={32} // Obrigatório
                className="w-8 h-8"
            />
            <span className="text-xl font-extrabold text-red-600">
                Refeita.AI
            </span>
        </Link>

        <nav className="space-x-4">
            {/* ... */}
        </nav>

      </div>
    </header>
  );
}