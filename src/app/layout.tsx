// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { AuthProvider } from '@/contexts/AuthContext';
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// ------------------------------------------------------------------
// ⚡ METADADOS OTIMIZADOS
// ------------------------------------------------------------------
export const metadata: Metadata = {
  title: "Refeita.AI | Receitas Inteligentes com o que você tem",
  description: "Transforme sobras em pratos de chef. Tire uma foto da geladeira e deixe a IA criar sua próxima refeição.",
  keywords: ["receitas", "ia", "culinária", "geladeira", "desperdício zero"],
  openGraph: {
    title: "Refeita.AI",
    description: "Sua geladeira, transformadada em restaurante.",
    url: "https://refeita-ai.acaoleve.com",
    siteName: "Ação Leve",
    images: '/logo.png',
  },
  icons: {
    icon: '/favicon.ico', 
    apple: '/apple-touch-icon.png', 
    shortcut: '/favicon-32x32.png',
    other: [
       { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' },
       { rel: 'icon', url: '/android-chrome-192x192.png', sizes: '192x192' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={`antialiased bg-gray-50 text-gray-900`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}