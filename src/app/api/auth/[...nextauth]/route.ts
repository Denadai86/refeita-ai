// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
// Usaremos Credentials Provider para simular ou integrar com tokens de Firebase Auth
import CredentialsProvider from 'next-auth/providers/credentials';

// Usaremos a função getToken() do Firebase Admin para verificar o token JWT.
import { adminAuth } from '@/lib/firebase-admin';

// --- Opções de Autenticação ---
export const authOptions: NextAuthOptions = {
  // Configuração da Sessão
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  // Provedores (Aqui usamos Credentials para receber o token do Firebase)
  providers: [
    CredentialsProvider({
      // O nome é apenas para UI do NextAuth (se houver uma página padrão)
      name: 'Firebase Auth',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      
      // Esta é a função que o NextAuth chamará ao tentar fazer login com o token
      async authorize(credentials, req) {
        if (credentials?.idToken) {
          try {
            // 1. Verificar o token JWT assinado pelo Firebase Admin SDK
            const decodedToken = await adminAuth.verifyIdToken(credentials.idToken);
            
            // 2. Retorna um objeto de usuário que será serializado na sessão JWT
            return {
              id: decodedToken.uid,
              email: decodedToken.email,
              name: decodedToken.name || 'Usuário Refeita.AI',
              // Você pode incluir claims personalizados do Firebase aqui:
              plan: decodedToken.plan || 'FREE', 
            };
          } catch (error) {
            console.error('Erro na verificação do token Firebase:', error);
            return null; // Falha na autenticação
          }
        }
        return null; // Nenhuma credencial fornecida
      },
    }),
  ],

  // Gerenciamento de Callbacks JWT
  callbacks: {
    async jwt({ token, user }) {
      // O usuário (user) só está presente no primeiro login
      if (user) {
        token.id = user.id;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      // Adiciona campos personalizados do token JWT na sessão visível para o cliente
      if (token) {
        session.user.id = token.id;
        session.user.plan = token.plan as string;
      }
      return session;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  // pages: { /* opcional: se quiser páginas de login/erro customizadas */ },
};

// Exporta o handler da API para os métodos GET e POST
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

// --- Extensão de Tipos (OPCIONAL, mas altamente recomendado) ---
// Você pode criar um arquivo separado (types/next-auth.d.ts) para estender a tipagem
/*
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      plan: string; // Exemplo de campo customizado
    };
  }
  interface User {
    id: string;
    plan: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    plan: string;
  }
}
*/