import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MIGRAÇÃO VITE → NEXT.JS - AUTENTICAÇÃO
 * 
 * PROBLEMA ORIGINAL:
 * - O contexto de autenticação usava Prisma diretamente no cliente
 * - Next.js não permite uso direto do Prisma no lado do cliente
 * - Isso causava erros de "PrismaClient is not defined"
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Criada API Route para autenticação (/api/auth)
 * - Autenticação movida para o servidor
 * - Cliente faz requisições fetch para a API
 * 
 * MUDANÇAS:
 * - Antes: Prisma no cliente (não funcionava no Next.js)
 * - Depois: API Route + fetch no cliente
 */

// Configuração de usuários hardcoded para autenticação
// TODO: Migrar para sistema de senhas criptografadas no banco
const PASSWORDS = {
  // Escola Rockfeller Sede
  'admin@rockfeller.com.br': 'admin123',
  'ricardo@rockfeller.com.br': 'ricardo123',
  
  // Escola Rockfeller Navegantes
  'admin@navegantes.com.br': 'navegantes123',
  'navegantes@rockfellerbrasil.com.br': 'S@lmos2714',
  'tatiana.direito@hotmail.com': 'tatiana123',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password, type } = await request.json();

    // Validação das credenciais
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificação das credenciais hardcoded
    // TODO: Implementar hash de senhas
    if (PASSWORDS[email] !== password) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    let user = null;

    // Buscar usuário baseado no tipo
    if (type === 'school') {
      // Buscar na tabela de escolas (schools)
      user = await prisma.school.findFirst({
        where: { email },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: 'school',
            schoolId: user.id,
            school: user,
            firstLoginCompleted: true,
          },
        });
      }
    } else if (type === 'seller') {
      // Buscar na tabela de vendedores (sellers)
      user = await prisma.seller.findFirst({
        where: { email },
        include: { school: true },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: 'seller',
            role: user.role,
            schoolId: user.schoolId,
            school: user.school,
            firstLoginCompleted: true,
          },
        });
      }
    } else {
      // Se não especificou tipo, tentar em ambas as tabelas
      user = await prisma.school.findFirst({
        where: { email },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: 'school',
            schoolId: user.id,
            school: user,
            firstLoginCompleted: true,
          },
        });
      }

      user = await prisma.seller.findFirst({
        where: { email },
        include: { school: true },
      });

      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            type: 'seller',
            role: user.role,
            schoolId: user.schoolId,
            school: user.school,
            firstLoginCompleted: true,
          },
        });
      }
    }

    // Se chegou aqui, usuário não foi encontrado
    return NextResponse.json(
      { error: 'Usuário não encontrado' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 