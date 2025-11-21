// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google'; // Provider preferido para baixa fricção

// Certifica-se de que a exportação da função 'auth' para Server Actions funciona.
// A função 'auth' será usada para obter a sessão no lado do servidor.
// Esta importação é necessária para o 'generateRecipeAction'.
import { getAdminAuth } from '@/lib/firebase-admin';
//import { auth as adminAuth } from '@/lib/firebase-admin'; // Mantido caso você queira usar o Admin SDK em outros locais.

// Variáveis de ambiente
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
    // --- Configuração de Sessão e JWT ---
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 dias
    },
    
    // --- Provedor Único: Google ---
    providers: [
        GoogleProvider({
            // 🚨 Use o '!' para o TypeScript parar de reclamar, assumindo que você os configurou na Vercel
            clientId: GOOGLE_CLIENT_ID!,
            clientSecret: GOOGLE_CLIENT_SECRET!,
        }),
    ],

    // --- Callbacks de Gerenciamento (Dependem do next-auth.d.ts) ---
    callbacks: {
        async jwt({ token, user }) {
            // O 'user' existe no primeiro login (via Google)
            if (user) {
                token.id = user.id;
                // Inicializa o plano como 'FREE' no JWT.
                // O tipo 'User' agora inclui 'plan' (graças ao next-auth.d.ts).
                token.plan = (user as any).plan || 'FREE'; 
            }
            return token;
        },
        async session({ session, token }) {
            // Adiciona campos customizados do JWT na sessão
            if (token.id) {
                session.user.id = token.id as string;
            }
            if (token.plan) {
                session.user.plan = token.plan as 'FREE' | 'PRO' | 'LIFETIME';
            }
            return session;
        },
    },

    // --- Configuração Essencial de Segurança ---
    secret: process.env.NEXTAUTH_SECRET, 
    
    // 🛑 CORREÇÃO: Removido o bloco 'logger' que estava causando o erro de tipagem no build
    // logger: ... (REMOVIDO)
};

// Exporta o handler da API para os métodos GET e POST
const handler = NextAuth(authOptions);

// Exporta 'auth' (renomeado) para uso em Server Actions (como 'generateRecipeAction')
export { handler as GET, handler as POST, authOptions as auth };