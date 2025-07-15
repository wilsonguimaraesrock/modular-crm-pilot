import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Singleton para evitar múltiplas conexões em desenvolvimento
const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Função para conectar ao banco
export const connectDatabase = async () => {
  try {
    await prisma.$connect()
    console.log('✅ Conectado ao banco MySQL com sucesso')
    return true
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco:', error)
    return false
  }
}

// Função para desconectar do banco
export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect()
    console.log('🔌 Desconectado do banco MySQL')
  } catch (error) {
    console.error('❌ Erro ao desconectar do banco:', error)
  }
}

// Função para verificar saúde da conexão
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'healthy', message: 'Banco de dados funcionando' }
  } catch (error) {
    return { status: 'unhealthy', message: `Erro: ${error}` }
  }
}

export { prisma }
export default prisma 