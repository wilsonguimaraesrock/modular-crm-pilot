/**
 * MIGRAÇÃO VITE → NEXT.JS - PÁGINA PRINCIPAL
 * 
 * PROBLEMA ORIGINAL:
 * - Projeto Vite usava src/main.tsx como entry point
 * - Next.js usa src/app/page.tsx como página principal
 * - Necessário adaptar a estrutura de renderização
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Criada página principal usando App Router
 * - Mantidos todos os providers e componentes
 * - Adaptada estrutura para Next.js
 * 
 * MUDANÇAS:
 * - Antes: src/main.tsx + index.html
 * - Depois: src/app/page.tsx + layout.tsx
 * 
 * BENEFÍCIOS:
 * - Compatibilidade com Next.js
 * - Melhor SEO
 * - Suporte a SSR
 */

'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseAuthProvider } from '@/contexts/DatabaseAuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';

export default function Home() {
  return (
    <AuthProvider>
      <DatabaseAuthProvider>
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      </DatabaseAuthProvider>
    </AuthProvider>
  );
} 