import type { Metadata } from "next";
import { Inter } from "next/font/google"; 
import { AuthProvider } from '@/contexts/AuthContext';
import CookieBanner from '@/components/CookieBanner';
import Footer from '@/components/Footer';
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL('https://refeita-ai.acaoleve.com'),
  title: "Refeita.AI | Receitas Inteligentes com o que você tem",
  description: "Transforme sobras em pratos de chef. Tire uma foto da geladeira e deixe a IA criar sua próxima refeição.",
  keywords: ["receitas", "ia", "culinária", "geladeira", "desperdício zero"],
  openGraph: {
    title: "Refeita.AI",
    description: "Sua geladeira, transformada em restaurante.",
    url: "https://refeita-ai.acaoleve.com",
    siteName: "Ação Leve",
    images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Refeita AI Preview' }],
    locale: 'pt_BR',
    type: 'website',
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
    <html lang="pt-BR" className={`${inter.variable} scroll-smooth`}>
      <body className="antialiased bg-gray-50 text-gray-900 selection:bg-green-100">
        <AuthProvider>
          {/* O Flex e Min-h-screen garantem que o footer fique sempre no rodapé */}
          <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
            <CookieBanner />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}