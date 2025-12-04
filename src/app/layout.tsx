// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// ------------------------------------------------------------------
// ⚡ METADADOS COMPLETO E OTIMIZADO (Favicon para todos os dispositivos)
// ------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Refeita.AI | Geração de Receitas Inteligentes",
  description: "Crie receitas criativas e personalize seu cardápio com base nos ingredientes que você tem em casa, usando a inteligência artificial Gemini.",
  keywords: ["micro-saas", "receitas", "inteligência artificial", "gemini", "culinária"],
  
  // SEO & OpenGraph
  openGraph: {
    title: "Refeita.AI",
    description: "Geração de Receitas Inteligentes",
    url: "https://refeita-ai.acaoleve.com",
    siteName: "Ação Leve Micro SaaS",
    images: '/logo.png', // Usando o logo principal para compartilhamento
  },

  // 🎯 CONFIGURAÇÃO COMPLETA DE ÍCONES (Baseado nos arquivos da pasta /public)
  icons: {
    // Padrão e mais comum
    icon: '/favicon.ico', 
    
    // Apple Touch Icon (para atalho na tela inicial de iPhones/iPads)
    apple: '/apple-touch-icon.png', 
    
    // Atalhos e Outros tamanhos comuns
    shortcut: '/favicon-32x32.png',
    other: [
        { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' },
        { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
    ],
  },

  // 💡 Manifest para suporte total a PWA e dispositivos Android
  manifest: '/site.webmanifest',
};
// ------------------------------------------------------------------


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Usa lang="pt-BR" e aplica a fonte customizada
    <html lang="pt-BR" className={inter.variable}>
      <body className={`antialiased`}>
        {/* Container principal para o background e min-height */}
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}