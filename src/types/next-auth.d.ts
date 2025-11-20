import 'next-auth';
import { DefaultSession } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

// 1. Extender o tipo User (Usado no callback jwt)
declare module 'next-auth' {
  /**
   * Extende o tipo User para incluir o campo 'plan'.
   * O User é o objeto retornado pelo Provider (função 'authorize').
   */
  interface User {
    id: string;
    plan: 'FREE' | 'PRO' | 'LIFETIME'; // Use uma união literal para tipagem estrita
  }

  /**
   * Extende o tipo Session para incluir o campo 'plan' no objeto user.
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      plan: 'FREE' | 'PRO' | 'LIFETIME';
    } & DefaultSession['user'];
  }
}

// 2. Extender o tipo JWT (Usado no callback jwt e session)
declare module 'next-auth/jwt' {
  /**
   * Extende o tipo JWT para incluir o campo 'plan'.
   * O JWT é o token serializado.
   */
  interface JWT extends DefaultJWT {
    id: string; // Para garantir que o ID está no token
    plan: 'FREE' | 'PRO' | 'LIFETIME';
  }
}