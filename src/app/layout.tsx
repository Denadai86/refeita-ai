// app/layout.tsx

import type { Metadata } from "next";
// 1. Importe a fonte do Next.js/Google que você deseja (ou remova se usar padrão)
import { Inter } from "next/font/google"; 

import "./globals.css";
// 2. Importe o AuthProvider que criamos na etapa anterior
import AuthProvider from "@/components/auth/AuthProvider"; 

// 3. Inicializa a fonte, se necessário (Aqui usamos Inter como exemplo, mas você pode usar o padrão)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// 4. Metadados atualizados para o projeto Refeita.AI (Melhor prática de SEO)
export const metadata: Metadata = {
  title: "Refeita.AI | Geração de Receitas Inteligentes",
  description: "Crie receitas criativas e personalize seu cardápio com base nos ingredientes que você tem em casa, usando a inteligência artificial Gemini.",
  keywords: ["micro-saas", "receitas", "inteligência artificial", "gemini", "culinária"],
  openGraph: {
    title: "Refeita.AI",
    description: "Geração de Receitas Inteligentes",
    url: "https://refeita-ai.acaoleve.com",
    siteName: "Ação Leve Micro SaaS",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 5. Troca lang="en" por lang="pt-BR"
    <html lang="pt-BR" className={inter.variable}>
      {/* Removemos as variáveis de fonte Geist se você não precisar delas */}
      <body className={`antialiased`}>
        {/* 6. Envolve o app com o AuthProvider para contexto de sessão */}
        <AuthProvider>
          {/* Adicionamos uma div principal com o fundo da aplicação, facilitando o layout */}
          <div className="min-h-screen bg-gray-50 text-gray-900">
             {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

/*
Caso você queira manter as fontes Geist:
Basta reintroduzir as importações e variáveis:
import { Geist, Geist_Mono } from "next/font/google";
// ...
<html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
// ...
*/