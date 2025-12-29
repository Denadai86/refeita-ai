// src/contexts/AuthContext.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isPremium: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Escuta mudanças na autenticação (login/logout) em tempo real
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", currentUser?.email); // Debug
      setUser(currentUser);
      setLoading(false);
      
      // Futuro: Se tiver usuário, buscar status premium no Firestore aqui
      if (currentUser) {
        // setIsPremium(await checkPremiumStatus(currentUser.uid))
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      // 1. Feedback visual imediato (opcional, se tiver loading global)
      console.log("🚀 Iniciando fluxo de login..."); 

      // 2. Tenta abrir o Popup
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log("✅ Sucesso! Usuário:", result.user.displayName);
      
      // O onAuthStateChanged vai capturar a mudança de estado automaticamente

    } catch (error: any) {
      // 3. Tratamento de erros específicos
      console.error("❌ Erro detalhado no login:", error.code, error.message);

      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("O usuário fechou a janela de login antes de terminar.");
        // Não precisamos alertar o usuário aqui, pois foi ação dele.
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.warn("Conflito de requisições de popup.");
      } else if (error.code === 'auth/popup-blocked') {
        alert("O navegador bloqueou o popup. Por favor, permita popups para este site.");
      } else {
        // Erros reais de configuração ou rede
        alert(`Falha no login: ${error.message}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("👋 Logout realizado.");
      setUser(null);
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isPremium }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);