// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// 4. Metadados ATUALIZADOS para incluir os ícones
export const metadata: Metadata = {
  title: "Refeita.AI | Geração de Receitas Inteligentes",
  description: "Crie receitas criativas e personalize seu cardápio com base nos ingredientes que você tem em casa, usando a inteligência artificial Gemini.",
  keywords: ["micro-saas", "receitas", "inteligência artificial", "gemini", "culinária"],
  openGraph: {
    title: "Refeita.AI",
    description: "Geração de Receitas Inteligentes",
    url: "https://refeita-ai.acaoleve.com",
    siteName: "Ação Leve Micro SaaS",
  },
  // ⚡ CORREÇÃO DO FAVICON: Aponta para os arquivos na pasta /public
  icons: {
    icon: '/favicon.ico', // Para a maioria dos navegadores
    shortcut: '/favicon-32x32.png', // Atalho/tamanho específico
    apple: '/apple-touch-icon.png', // Para dispositivos Apple
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`antialiased`}>
        <div className="min-h-screen bg-gray-50 text-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}