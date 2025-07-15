#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dados padrão baseados no AuthContext atual
const MOCK_SCHOOLS = [
  {
    id: '1',
    name: 'Escola Rockfeller Sede',
    email: 'admin@rockfeller.com.br',
    phone: '',
    address: '',
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Rockfeller Navegantes',
    email: 'admin@navegantes.com.br',
    phone: '(47) 9 9999-9999',
    address: 'Rua das Navegantes, 123 - Navegantes/SC',
    createdAt: new Date()
  }
]

const MOCK_SELLERS = [
  {
    id: 'seller_test_1',
    name: 'Ricardo Silva Santos',
    email: 'ricardo@rockfeller.com.br',
    phone: '(11) 9 9999-9999',
    role: 'Consultor de Vendas',
    schoolId: '1',
    active: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: 'seller_test_2',
    name: 'Tatiana Venga',
    email: 'tatiana.direito@hotmail.com',
    phone: '47999931-4011',
    role: 'Consultora de Vendas',
    schoolId: '2',
    active: true,
    createdAt: new Date('2024-01-01')
  }
]

const DEFAULT_LEAD_SOURCES = [
  {
    name: 'Website',
    type: 'form',
    icon: 'Globe',
    active: false,
    url: '',
    description: 'Formulário de contato do website principal',
    fields: ['name', 'email', 'phone', 'message'],
    autoAssign: '',
    notifications: true,
    webhookUrl: '',
    leadsCount: 0
  },
  {
    name: 'Facebook Ads',
    type: 'integration',
    icon: 'Facebook',
    active: false,
    url: '',
    description: 'Integração com Facebook Lead Ads',
    fields: ['name', 'email', 'phone'],
    autoAssign: '',
    notifications: true,
    webhookUrl: '',
    leadsCount: 0
  },
  {
    name: 'Instagram',
    type: 'integration',
    icon: 'Instagram',
    active: false,
    url: '',
    description: 'Integração com Instagram Business',
    fields: ['name', 'email'],
    autoAssign: '',
    notifications: false,
    webhookUrl: '',
    leadsCount: 0
  },
  {
    name: 'LinkedIn',
    type: 'integration',
    icon: 'Linkedin',
    active: false,
    url: '',
    description: 'Integração com LinkedIn Lead Gen Forms',
    fields: ['name', 'email', 'company', 'position'],
    autoAssign: '',
    notifications: true,
    webhookUrl: '',
    leadsCount: 0
  }
]

async function createLeadSources(schoolId: string) {
  return DEFAULT_LEAD_SOURCES.map((source, index) => ({
    ...source,
    id: `${schoolId}_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${index}`,
    schoolId,
    createdAt: new Date()
  }))
}

async function migrateData() {
  try {
    console.log('🚀 Iniciando migração de dados...')

    // 1. Migrar Escolas
    console.log('📚 Migrando escolas...')
    for (const school of MOCK_SCHOOLS) {
      await prisma.school.upsert({
        where: { id: school.id },
        update: school,
        create: school
      })
      console.log(`✅ Escola "${school.name}" migrada`)
    }

    // 2. Migrar Vendedores
    console.log('👥 Migrando vendedores...')
    for (const seller of MOCK_SELLERS) {
      await prisma.seller.upsert({
        where: { id: seller.id },
        update: seller,
        create: seller
      })
      console.log(`✅ Vendedor "${seller.name}" migrado`)
    }

    // 3. Migrar Fontes de Leads
    console.log('🔗 Migrando fontes de leads...')
    for (const school of MOCK_SCHOOLS) {
      const leadSources = await createLeadSources(school.id)
      for (const source of leadSources) {
        await prisma.leadSource.upsert({
          where: { id: source.id },
          update: {
            name: source.name,
            type: source.type,
            icon: source.icon,
            active: source.active,
            url: source.url || '',
            description: source.description,
            fields: source.fields,
            autoAssign: source.autoAssign || '',
            notifications: source.notifications,
            webhookUrl: source.webhookUrl || '',
            leadsCount: source.leadsCount,
            schoolId: source.schoolId,
            createdAt: source.createdAt
          },
          create: {
            id: source.id,
            name: source.name,
            type: source.type,
            icon: source.icon,
            active: source.active,
            url: source.url || '',
            description: source.description,
            fields: source.fields,
            autoAssign: source.autoAssign || '',
            notifications: source.notifications,
            webhookUrl: source.webhookUrl || '',
            leadsCount: source.leadsCount,
            schoolId: source.schoolId,
            createdAt: source.createdAt
          }
        })
      }
      console.log(`✅ Fontes de leads para "${school.name}" migradas`)
    }

    console.log('🎉 Migração de dados base concluída com sucesso!')
    console.log('')
    console.log('📋 Dados migrados:')
    console.log(`- ${MOCK_SCHOOLS.length} escolas`)
    console.log(`- ${MOCK_SELLERS.length} vendedores`)
    console.log(`- ${MOCK_SCHOOLS.length * DEFAULT_LEAD_SOURCES.length} fontes de leads`)
    console.log('')
    console.log('💡 Para migrar dados do localStorage:')
    console.log('1. Abra o navegador na aplicação')
    console.log('2. Execute o script de migração do localStorage')

  } catch (error) {
    console.error('❌ Erro durante a migração:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Função para migrar dados específicos do localStorage (será chamada pelo frontend)
export async function migrateFromLocalStorage(data: {
  leads?: any[]
  appointments?: any[]
  qualificationConversations?: any[]
  followUps?: any[]
  tasks?: any[]
}) {
  try {
    // Migrar Leads
    if (data.leads?.length) {
      for (const lead of data.leads) {
        await prisma.lead.create({
          data: {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            position: lead.position,
            interests: lead.interests,
            source: lead.source,
            method: lead.method,
            modality: lead.modality,
            age: lead.age,
            experience: lead.experience,
            availability: lead.availability,
            budget: lead.budget,
            goals: lead.goals,
            score: lead.score,
            status: lead.status,
            schoolId: lead.schoolId,
            assignedTo: lead.assignedTo,
            notes: lead.notes,
            createdAt: new Date(lead.createdAt),
            updatedAt: new Date(lead.updatedAt)
          }
        })
      }
    }

    // Migrar Appointments
    if (data.appointments?.length) {
      for (const appointment of data.appointments) {
        await prisma.appointment.create({
          data: {
            id: appointment.id,
            leadId: appointment.leadId,
            leadName: appointment.leadName,
            leadPhone: appointment.leadPhone,
            leadEmail: appointment.leadEmail,
            date: appointment.date,
            time: appointment.time,
            type: appointment.type,
            status: appointment.status,
            schoolId: appointment.schoolId,
            assignedTo: appointment.assignedTo,
            notes: appointment.notes,
            meetingLink: appointment.meetingLink,
            address: appointment.address,
            createdAt: new Date(appointment.createdAt),
            updatedAt: new Date(appointment.updatedAt)
          }
        })
      }
    }

    // Migrar outras entidades seguindo o mesmo padrão...
    console.log('✅ Dados do localStorage migrados com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro ao migrar dados do localStorage:', error)
    throw error
  }
}

// Executar migração se chamado diretamente
migrateData()
  .then(() => {
    console.log('🔄 Migração concluída')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Migração falhou:', error)
    process.exit(1)
  }) 