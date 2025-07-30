import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MIGRAÇÃO VITE → NEXT.JS - API DE DADOS
 * 
 * PROBLEMA ORIGINAL:
 * - O contexto DatabaseAuthContext usava Prisma diretamente no cliente
 * - Next.js não permite uso direto do Prisma no lado do cliente
 * - Isso causava erros de "PrismaClient is not defined"
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Criada API Route para carregamento de dados (/api/data)
 * - Todas as consultas ao banco movidas para o servidor
 * - Cliente faz requisições fetch para a API
 * 
 * MUDANÇAS:
 * - Antes: Prisma no cliente (não funcionava no Next.js)
 * - Depois: API Route + fetch no cliente
 * 
 * BENEFÍCIOS:
 * - Melhor segurança (dados não expostos no cliente)
 * - Melhor performance (consultas otimizadas no servidor)
 * - Compatibilidade com Next.js
 */

export async function GET() {
  try {
    // Busca todos os dados necessários para o CRM
    // MIGRAÇÃO: Agora o Prisma roda no servidor (API Route)
    const [
      schools,
      leadSources,
      qualificationConversations,
      sellers,
      followUps,
      appointments,
      tasks,
      leads,
    ] = await Promise.all([
      prisma.school.findMany(),
      prisma.leadSource.findMany(),
      prisma.qualificationConversation.findMany(),
      prisma.seller.findMany(),
      prisma.followUp.findMany(),
      prisma.appointment.findMany(),
      prisma.task.findMany(),
      prisma.lead.findMany(),
    ]);

    return NextResponse.json({
      schools,
      leadSources,
      qualificationConversations,
      sellers,
      followUps,
      appointments,
      tasks,
      leads,
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 