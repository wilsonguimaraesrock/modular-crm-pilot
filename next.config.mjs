/**
 * MIGRAÇÃO VITE → NEXT.JS - CONFIGURAÇÃO
 * 
 * PROBLEMA ORIGINAL:
 * - Projeto estava configurado para Vite
 * - Next.js requer configuração específica
 * - Necessário ajustar webpack e outras configurações
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Criada configuração específica para Next.js
 * - Ajustado webpack para compatibilidade
 * - Configurado App Router
 * 
 * MUDANÇAS:
 * - Antes: vite.config.ts
 * - Depois: next.config.mjs
 * 
 * BENEFÍCIOS:
 * - Compatibilidade com Next.js
 * - Melhor performance
 * - Suporte a SSR/SSG
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração experimental para App Router
  // MIGRAÇÃO: Habilitado para usar a nova estrutura de pastas
  experimental: {
    appDir: true,
  },
  
  // Configuração de imagens
  // MIGRAÇÃO: Permitir imagens de localhost para desenvolvimento
  images: {
    domains: ['localhost'],
  },
  
  // Configuração de webpack para compatibilidade
  // MIGRAÇÃO: Necessário para evitar erros de módulos
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig; 