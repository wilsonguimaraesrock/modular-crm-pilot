'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  school: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * MIGRAÇÃO VITE → NEXT.JS - CONTEXTO DE AUTENTICAÇÃO
 * 
 * PROBLEMA ORIGINAL:
 * - O contexto usava Prisma diretamente no cliente
 * - Next.js não permite uso direto do Prisma no lado do cliente
 * - Isso causava erros de "PrismaClient is not defined"
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Removido uso direto do Prisma
 * - Implementado fetch para API Routes
 * - Mantida persistência no localStorage
 * 
 * MUDANÇAS:
 * - Antes: Prisma no cliente (não funcionava no Next.js)
 * - Depois: fetch para /api/auth + localStorage
 * 
 * BENEFÍCIOS:
 * - Compatibilidade com Next.js
 * - Melhor separação cliente/servidor
 * - Mantém funcionalidade de persistência
 */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função de login usando API Routes
  // MIGRAÇÃO: Agora usa fetch em vez de Prisma direto
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro no login:', error);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      
      // Salva no localStorage para persistência
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  // Carrega usuário do localStorage na inicialização
  // MIGRAÇÃO: Mantida funcionalidade de persistência
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 