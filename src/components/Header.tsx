// src/components/Header.tsx (AJUSTE TEMPORÁRIO COM <img>)

'use client';

import Link from 'next/link';
// import Image from 'next/image'; // <-- REMOVA OU COMENTE ESSA LINHA

export default function Header() {
  
  // Vamos usar o file.svg (image_9f301f.png) como exemplo. 
  const logoSrc = "/file.svg"; 

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        
        <Link href="/" className="flex items-center space-x-2">
            
            {/* ⚡ AJUSTE FINAL: Usando a tag <img> nativa */}
            <img
                src={logoSrc} 
                alt="Refeita.AI Logo"
                width={32}
                height={32}
                className="w-8 h-8"
            />
            {/* Se você tiver o logo.png, substitua o <img> pelo seu <Image> anterior, mas COM certeza de que width/height estão lá */}
            
            <span className="text-xl font-extrabold text-red-600">
                Refeita.AI
            </span>
        </Link>

        {/* ... */}
      </div>
    </header>
  );
}