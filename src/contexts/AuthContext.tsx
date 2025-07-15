import React, { createContext, useContext, useState, useEffect } from 'react';

// Interfaces
export interface School {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  schoolId: string;
  active: boolean;
  createdAt: Date;
}

export interface LeadSource {
  id: string;
  name: string;
  type: 'form' | 'integration';
  icon: string; // Nome do ícone
  active: boolean;
  url: string;
  description: string;
  fields: string[];
  autoAssign: string;
  notifications: boolean;
  webhookUrl: string;
  leadsCount: number;
  schoolId: string; // Nova propriedade para vincular à escola
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  interests?: string;
  source: string;
  method: string; // Adults, Teens, Kids, Practice & Progress, On Demand
  modality: string; // Presencial ou Live
  age?: string;
  experience?: string;
  availability?: string;
  budget?: string;
  goals?: string;
  score: number;
  status: 'novo' | 'qualificado' | 'agendado' | 'fechado' | 'perdido';
  schoolId: string;
  assignedTo?: string; // ID do vendedor
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  date: string;
  time: string;
  type: 'presencial' | 'online';
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado' | 'remarcado' | 'compareceu' | 'nao_compareceu' | 'em_fechamento' | 'matriculou' | 'nao_matriculou';
  schoolId: string;
  assignedTo?: string; // ID do vendedor
  notes?: string;
  meetingLink?: string; // Para reuniões online
  address?: string; // Para reuniões presenciais
  createdAt: Date;
  updatedAt: Date;
}

export interface QualificationConversation {
  id: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  messages: Array<{
    type: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
  }>;
  stage: number;
  score: number;
  stageScores: Record<string, number>;
  schoolId: string;
  assignedSeller?: string;
  status: 'active' | 'completed' | 'abandoned';
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  type: 'ligacao' | 'email' | 'whatsapp' | 'visita' | 'reuniao' | 'outro';
  priority: 'alta' | 'media' | 'baixa';
  description: string;
  scheduledDate: Date;
  status: 'pendente' | 'concluido' | 'cancelado';
  notes?: string;
  schoolId: string;
  assignedTo?: string; // ID do vendedor
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'follow_up' | 'manual';
  priority: 'alta' | 'media' | 'baixa';
  status: 'pendente' | 'concluido' | 'cancelado';
  scheduledDate: Date;
  completedDate?: Date;
  schoolId: string;
  assignedTo?: string; // ID do vendedor
  leadId?: string; // Para tarefas relacionadas a leads
  leadName?: string; // Para tarefas relacionadas a leads
  category?: string; // Categoria da tarefa (ex: vendas, marketing, admin)
  estimatedTime?: number; // Tempo estimado em minutos
  actualTime?: number; // Tempo real gasto em minutos
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  type: 'school' | 'seller';
  schoolId: string;
  school?: School;
  seller?: Seller;
}

interface AuthContextType {
  user: AuthUser | null;
  schools: School[];
  sellers: Seller[];
  leadSources: LeadSource[];
  leads: Lead[];
  appointments: Appointment[];
  qualificationConversations: QualificationConversation[];
  followUps: FollowUp[];
  tasks: Task[];
  currentSchool: School | null;
  isLoading: boolean;
  
  // Auth functions
  loginAsSchool: (email: string, password: string) => Promise<boolean>;
  loginAsSeller: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // School functions
  registerSchool: (data: Omit<School, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSchool: (id: string, data: Partial<School>) => Promise<boolean>;
  deleteSchool: (id: string) => Promise<boolean>;
  
  // Seller functions
  registerSeller: (data: Omit<Seller, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSeller: (id: string, data: Partial<Seller>) => Promise<boolean>;
  deleteSeller: (id: string) => Promise<boolean>;
  getSellersBySchool: (schoolId: string) => Seller[];
  
  // Lead Sources functions
  registerLeadSource: (data: Omit<LeadSource, 'id' | 'createdAt'>) => Promise<boolean>;
  updateLeadSource: (id: string, data: Partial<LeadSource>) => Promise<boolean>;
  deleteLeadSource: (id: string) => Promise<boolean>;
  getLeadSourcesBySchool: (schoolId: string) => LeadSource[];
  toggleLeadSource: (id: string) => Promise<boolean>;
  recreateDefaultLeadSources: (schoolId: string) => void;
  
  // Lead functions
  registerLead: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  deleteLead: (id: string) => Promise<boolean>;
  getLeadsBySchool: (schoolId: string) => Lead[];
  getLeadStats: (schoolId: string) => {
    leadsHoje: number;
    qualificados: number;
    agendados: number;
    fechados: number;
    novosLeads: number;
  };
  
  // Lead distribution functions
  getNextAvailableSeller: (schoolId: string) => Seller | null;
  
  // Appointment functions
  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  getAppointmentsBySchool: (schoolId: string) => Appointment[];
  
  // Attendance statistics functions
  getAttendanceStats: (schoolId: string, month?: string) => {
    totalAgendados: number;
    compareceram: number;
    matricularam: number;
    naoCompareceram: number;
    taxaComparecimento: number;
    taxaMatricula: number;
    taxaConversao: number;
  };
  getAttendanceStatsByMonth: (schoolId: string, startMonth: string, endMonth: string) => Array<{
    month: string;
    totalAgendados: number;
    compareceram: number;
    matricularam: number;
    naoCompareceram: number;
    taxaComparecimento: number;
    taxaMatricula: number;
    taxaConversao: number;
  }>;
  getAttendanceStatsBySeller: (schoolId: string, sellerId: string, month?: string) => {
    totalAgendados: number;
    compareceram: number;
    matricularam: number;
    naoCompareceram: number;
    taxaComparecimento: number;
    taxaMatricula: number;
    taxaConversao: number;
  };
  
  // Qualification Conversation functions
  createQualificationConversation: (data: Omit<QualificationConversation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<QualificationConversation | null>;
  updateQualificationConversation: (id: string, data: Partial<QualificationConversation>) => Promise<boolean>;
  getQualificationConversationsBySchool: (schoolId: string) => QualificationConversation[];
  getActiveQualificationConversation: (schoolId: string) => QualificationConversation | null;
  
  // Follow-up functions
  createFollowUp: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateFollowUp: (id: string, data: Partial<FollowUp>) => Promise<boolean>;
  deleteFollowUp: (id: string) => Promise<boolean>;
  getFollowUpsBySchool: (schoolId: string) => FollowUp[];
  getFollowUpsByLead: (leadId: string) => FollowUp[];
  
  // Task functions
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  getTasksBySchool: (schoolId: string) => Task[];
  getTasksByDate: (schoolId: string, date: Date) => Task[];
  getTasksByDateRange: (schoolId: string, startDate: Date, endDate: Date) => Task[];
  getTaskStats: (schoolId: string) => {
    total: number;
    pendentes: number;
    concluidas: number;
    atrasadas: number;
    performance: number;
  };
  getAllTasksForAgenda: (schoolId: string) => Task[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - em produção, isso viria de uma API/banco de dados
const MOCK_SCHOOLS: School[] = [
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
    email: 'navegantes@rockfellerbrasil.com.br',
    phone: '(47) 9 9999-9999',
    address: 'Rua das Navegantes, 123 - Navegantes/SC',
    createdAt: new Date()
  }
];

const MOCK_SELLERS: Seller[] = [
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
];

// Fontes de leads padrão (será criada uma cópia para cada escola)
const DEFAULT_LEAD_SOURCES = [
  {
    name: 'Website',
    type: 'form' as const,
    icon: 'Globe',
    active: true, // Mudança: ativa por padrão
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
    type: 'integration' as const,
    icon: 'Facebook',
    active: true, // Mudança: ativa por padrão
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
    type: 'integration' as const,
    icon: 'Instagram',
    active: true, // Mudança: ativa por padrão
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
    type: 'integration' as const,
    icon: 'Linkedin',
    active: true, // Mudança: ativa por padrão
    url: '',
    description: 'Integração com LinkedIn Lead Gen Forms',
    fields: ['name', 'email', 'company', 'position'],
    autoAssign: '',
    notifications: true,
    webhookUrl: '',
    leadsCount: 0
  }
];

// Criar fontes padrão para a escola sede (ID = '1')
const createSedeLeadSources = (): LeadSource[] => {
  return DEFAULT_LEAD_SOURCES.map((source, index) => ({
    ...source,
    id: `1_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${index}`,
    schoolId: '1',
    createdAt: new Date()
  }));
};

// Criar fontes padrão para a escola navegantes (ID = '2')
const createNavegantesLeadSources = (): LeadSource[] => {
  return DEFAULT_LEAD_SOURCES.map((source, index) => ({
    ...source,
    id: `2_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${index}`,
    schoolId: '2',
    createdAt: new Date()
  }));
};

const MOCK_LEAD_SOURCES: LeadSource[] = [...createSedeLeadSources(), ...createNavegantesLeadSources()];

// Função para obter senhas do localStorage (em produção, usar hash/criptografia)
const getMockPasswords = (): Record<string, string> => {
  const defaultPasswords = { 
    'admin@rockfeller.com.br': 'admin123',
    'ricardo@rockfeller.com.br': 'ricardo123',
    'navegantes@rockfellerbrasil.com.br': 'S@lmos2714',
    'tatiana.direito@hotmail.com': 'tatiana123'
  };
  try {
    const savedPasswords = localStorage.getItem('mock_passwords');
    if (savedPasswords) {
      return { ...defaultPasswords, ...JSON.parse(savedPasswords) };
    }
  } catch (error) {
    console.error('Erro ao recuperar senhas:', error);
  }
  return defaultPasswords;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [schools, setSchools] = useState<School[]>(() => {
    try {
      const savedSchools = localStorage.getItem('crm_schools');
      return savedSchools ? JSON.parse(savedSchools) : MOCK_SCHOOLS;
    } catch (error) {
      console.error('Erro ao recuperar escolas:', error);
      return MOCK_SCHOOLS;
    }
  });
  const [sellers, setSellers] = useState<Seller[]>(() => {
    try {
      const savedSellers = localStorage.getItem('crm_sellers');
      return savedSellers ? JSON.parse(savedSellers) : MOCK_SELLERS;
    } catch (error) {
      console.error('Erro ao recuperar vendedores:', error);
      return MOCK_SELLERS;
    }
  });
  const [leadSources, setLeadSources] = useState<LeadSource[]>(() => {
    try {
      const savedLeadSources = localStorage.getItem('crm_lead_sources');
      const sources = savedLeadSources ? JSON.parse(savedLeadSources) : MOCK_LEAD_SOURCES;
      
      console.log('🔍 Debug - Inicialização das fontes de leads:', {
        hasSavedSources: !!savedLeadSources,
        totalSources: sources.length,
        sources: sources.map(s => ({ id: s.id, name: s.name, schoolId: s.schoolId, active: s.active }))
      });
      
      return sources;
    } catch (error) {
      console.error('Erro ao recuperar fontes de leads:', error);
      return MOCK_LEAD_SOURCES;
    }
  });
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const savedLeads = localStorage.getItem('crm_leads');
      return savedLeads ? JSON.parse(savedLeads) : [];
    } catch (error) {
      console.error('Erro ao recuperar leads:', error);
      return [];
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const savedAppointments = localStorage.getItem('crm_appointments');
      return savedAppointments ? JSON.parse(savedAppointments) : [];
    } catch (error) {
      console.error('Erro ao recuperar agendamentos:', error);
      return [];
    }
  });
  const [qualificationConversations, setQualificationConversations] = useState<QualificationConversation[]>(() => {
    try {
      const savedConversations = localStorage.getItem('crm_qualification_conversations');
      return savedConversations ? JSON.parse(savedConversations) : [];
    } catch (error) {
      console.error('Erro ao recuperar conversas:', error);
      return [];
    }
  });
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const savedFollowUps = localStorage.getItem('crm_follow_ups');
      return savedFollowUps ? JSON.parse(savedFollowUps) : [];
    } catch (error) {
      console.error('Erro ao recuperar follow-ups:', error);
      return [];
    }
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const savedTasks = localStorage.getItem('crm_tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      console.error('Erro ao recuperar tarefas:', error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  // Computed values
  const currentSchool = user?.school || null;

  useEffect(() => {
    // Simular carregamento inicial
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Verificar se há usuário logado no localStorage
      const savedUser = localStorage.getItem('crm_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          const school = schools.find(s => s.id === parsedUser.schoolId);
          const seller = sellers.find(s => s.id === parsedUser.id && parsedUser.type === 'seller');
          
          setUser({
            ...parsedUser,
            school,
            seller
          });
        } catch (error) {
          console.error('Erro ao recuperar usuário:', error);
          localStorage.removeItem('crm_user');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [schools, sellers]);

  const loginAsSchool = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const school = schools.find(s => s.email === email);
      const passwords = getMockPasswords();
      if (!school || passwords[email] !== password) {
        return false;
      }

      const authUser: AuthUser = {
        id: school.id,
        name: school.name,
        email: school.email,
        type: 'school',
        schoolId: school.id,
        school
      };

      setUser(authUser);
      localStorage.setItem('crm_user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Erro no login da escola:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsSeller = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const seller = sellers.find(s => s.email === email && s.active);
      const passwords = getMockPasswords();
      if (!seller || passwords[email] !== password) {
        return false;
      }

      const school = schools.find(s => s.id === seller.schoolId);
      if (!school) {
        return false;
      }

      const authUser: AuthUser = {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        type: 'seller',
        schoolId: seller.schoolId,
        school,
        seller
      };

      setUser(authUser);
      localStorage.setItem('crm_user', JSON.stringify(authUser));
      return true;
    } catch (error) {
      console.error('Erro no login do vendedor:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  const registerSchool = async (data: Omit<School, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Verificar se email já existe
      if (schools.some(s => s.email === data.email)) {
        return false;
      }

      const newSchool: School = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      const updatedSchools = [...schools, newSchool];
      setSchools(updatedSchools);
      
      // Criar fontes de leads padrão para a nova escola
      const defaultSources = createDefaultLeadSources(newSchool.id);
      const updatedLeadSources = [...leadSources, ...defaultSources];
      setLeadSources(updatedLeadSources);
      
      // Salvar no localStorage
      localStorage.setItem('crm_schools', JSON.stringify(updatedSchools));
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar escola:', error);
      return false;
    }
  };

  const updateSchool = async (id: string, data: Partial<School>): Promise<boolean> => {
    try {
      const updatedSchools = schools.map(s => s.id === id ? { ...s, ...data } : s);
      setSchools(updatedSchools);
      localStorage.setItem('crm_schools', JSON.stringify(updatedSchools));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      return false;
    }
  };

  const deleteSchool = async (id: string): Promise<boolean> => {
    try {
      const updatedSchools = schools.filter(s => s.id !== id);
      const updatedSellers = sellers.filter(s => s.schoolId !== id);
      const updatedLeadSources = leadSources.filter(ls => ls.schoolId !== id);
      
      setSchools(updatedSchools);
      setSellers(updatedSellers);
      setLeadSources(updatedLeadSources);
      
      localStorage.setItem('crm_schools', JSON.stringify(updatedSchools));
      localStorage.setItem('crm_sellers', JSON.stringify(updatedSellers));
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      
      return true;
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      return false;
    }
  };

  const registerSeller = async (data: Omit<Seller, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      // Verificar se email já existe
      if (sellers.some(s => s.email === data.email)) {
        return false;
      }

      const newSeller: Seller = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date()
      };

      const updatedSellers = [...sellers, newSeller];
      setSellers(updatedSellers);
      localStorage.setItem('crm_sellers', JSON.stringify(updatedSellers));
      
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar vendedor:', error);
      return false;
    }
  };

  const updateSeller = async (id: string, data: Partial<Seller>): Promise<boolean> => {
    try {
      const updatedSellers = sellers.map(s => s.id === id ? { ...s, ...data } : s);
      setSellers(updatedSellers);
      localStorage.setItem('crm_sellers', JSON.stringify(updatedSellers));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      return false;
    }
  };

  const deleteSeller = async (id: string): Promise<boolean> => {
    try {
      const updatedSellers = sellers.filter(s => s.id !== id);
      setSellers(updatedSellers);
      localStorage.setItem('crm_sellers', JSON.stringify(updatedSellers));
      return true;
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      return false;
    }
  };

  const getSellersBySchool = (schoolId: string): Seller[] => {
    return sellers.filter(s => s.schoolId === schoolId);
  };

  // Função para criar fontes padrão para uma nova escola
  const createDefaultLeadSources = (schoolId: string): LeadSource[] => {
    return DEFAULT_LEAD_SOURCES.map((source, index) => ({
      ...source,
      id: `${schoolId}_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${index}`,
      schoolId,
      createdAt: new Date()
    }));
  };

  const registerLeadSource = async (data: Omit<LeadSource, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newLeadSource: LeadSource = {
        ...data,
        id: `${data.schoolId}_${data.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        createdAt: new Date()
      };

      console.log('🔍 Debug - Criando nova fonte de lead:', {
        originalData: data,
        newLeadSource: newLeadSource,
        currentLeadSourcesCount: leadSources.length
      });

      const updatedLeadSources = [...leadSources, newLeadSource];
      setLeadSources(updatedLeadSources);
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      
      console.log('🔍 Debug - Fonte criada com sucesso:', {
        newSourceId: newLeadSource.id,
        totalSourcesAfter: updatedLeadSources.length,
        active: newLeadSource.active,
        schoolId: newLeadSource.schoolId
      });
      
      // Verificar se a fonte foi salva corretamente
      const savedSources = JSON.parse(localStorage.getItem('crm_lead_sources') || '[]');
      console.log('🔍 Debug - Verificação após salvar:', {
        savedSourcesCount: savedSources.length,
        lastSource: savedSources[savedSources.length - 1]
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar fonte de lead:', error);
      return false;
    }
  };

  const updateLeadSource = async (id: string, data: Partial<LeadSource>): Promise<boolean> => {
    try {
      const updatedLeadSources = leadSources.map(ls => ls.id === id ? { ...ls, ...data } : ls);
      setLeadSources(updatedLeadSources);
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fonte de lead:', error);
      return false;
    }
  };

  const deleteLeadSource = async (id: string): Promise<boolean> => {
    try {
      const updatedLeadSources = leadSources.filter(ls => ls.id !== id);
      setLeadSources(updatedLeadSources);
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      return true;
    } catch (error) {
      console.error('Erro ao deletar fonte de lead:', error);
      return false;
    }
  };

  const getLeadSourcesBySchool = (schoolId: string): LeadSource[] => {
    console.log('🔍 Debug - getLeadSourcesBySchool - TODAS as fontes:', leadSources.map(s => ({
      id: s.id,
      name: s.name,
      active: s.active,
      schoolId: s.schoolId,
      type: s.type
    })));
    
    const filteredSources = leadSources.filter(ls => ls.schoolId === schoolId);
    console.log('🔍 Debug - getLeadSourcesBySchool:', {
      schoolId,
      totalSources: leadSources.length,
      filteredSources: filteredSources.length,
      sources: filteredSources.map(s => ({ id: s.id, name: s.name, active: s.active, type: s.type }))
    });
    return filteredSources;
  };

  // Função para forçar recriação das fontes padrão
  const recreateDefaultLeadSources = (schoolId: string): void => {
    console.log('🔧 Recriando fontes padrão para escola:', schoolId);
    
    // Criar fontes padrão para a escola específica
    const defaultSources = DEFAULT_LEAD_SOURCES.map((source, index) => ({
      ...source,
      id: `${schoolId}_${source.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${index}`,
      schoolId: schoolId,
      createdAt: new Date()
    }));

    // Filtrar fontes de outras escolas
    const otherSchoolsSources = leadSources.filter(ls => ls.schoolId !== schoolId);
    
    // Combinar fontes de outras escolas com as novas fontes padrão
    const updatedLeadSources = [...otherSchoolsSources, ...defaultSources];
    
    setLeadSources(updatedLeadSources);
    localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
    
    console.log('🔧 Fontes padrão recriadas:', {
      schoolId,
      newSourcesCount: defaultSources.length,
      totalSources: updatedLeadSources.length
    });
  };

  const toggleLeadSource = async (id: string): Promise<boolean> => {
    try {
      const updatedLeadSources = leadSources.map(ls => 
        ls.id === id ? { ...ls, active: !ls.active } : ls
      );
      setLeadSources(updatedLeadSources);
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      return true;
    } catch (error) {
      console.error('Erro ao alternar fonte de lead:', error);
      return false;
    }
  };

  // Lead functions
  const registerLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newLead: Lead = {
        ...data,
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedLeads = [...leads, newLead];
      setLeads(updatedLeads);
      localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
      
      // Atualizar contador da fonte de lead
      const updatedLeadSources = leadSources.map(ls => 
        ls.name.toLowerCase() === data.source.toLowerCase() && ls.schoolId === data.schoolId
          ? { ...ls, leadsCount: ls.leadsCount + 1 }
          : ls
      );
      setLeadSources(updatedLeadSources);
      localStorage.setItem('crm_lead_sources', JSON.stringify(updatedLeadSources));
      
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar lead:', error);
      return false;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<boolean> => {
    try {
      const updatedLeads = leads.map(l => 
        l.id === id ? { ...l, ...data, updatedAt: new Date() } : l
      );
      setLeads(updatedLeads);
      localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      return false;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      const updatedLeads = leads.filter(l => l.id !== id);
      setLeads(updatedLeads);
      localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
      return true;
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      return false;
    }
  };

  const getLeadsBySchool = (schoolId: string): Lead[] => {
    return leads.filter(l => l.schoolId === schoolId);
  };

  // Appointment functions
  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newAppointment: Appointment = {
        ...data,
        id: `appointment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedAppointments = [...appointments, newAppointment];
      setAppointments(updatedAppointments);
      localStorage.setItem('crm_appointments', JSON.stringify(updatedAppointments));
      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return false;
    }
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<boolean> => {
    try {
      const updatedAppointments = appointments.map(a => 
        a.id === id ? { ...a, ...data, updatedAt: new Date() } : a
      );
      setAppointments(updatedAppointments);
      localStorage.setItem('crm_appointments', JSON.stringify(updatedAppointments));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      const updatedAppointments = appointments.filter(a => a.id !== id);
      setAppointments(updatedAppointments);
      localStorage.setItem('crm_appointments', JSON.stringify(updatedAppointments));
      return true;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      return false;
    }
  };

  const getAppointmentsBySchool = (schoolId: string): Appointment[] => {
    return appointments.filter(a => a.schoolId === schoolId);
  };

  // Attendance statistics functions
  const getAttendanceStats = (schoolId: string, month?: string) => {
    const schoolAppointments = getAppointmentsBySchool(schoolId);
    
    // Filtrar por mês se especificado
    const filteredAppointments = month 
      ? schoolAppointments.filter(apt => {
          const aptDate = new Date(apt.date);
          const targetMonth = new Date(month + '-01');
          return aptDate.getFullYear() === targetMonth.getFullYear() && 
                 aptDate.getMonth() === targetMonth.getMonth();
        })
      : schoolAppointments;

    const totalAgendados = filteredAppointments.length;
    const compareceram = filteredAppointments.filter(apt => 
      apt.status === 'compareceu' || apt.status === 'em_fechamento' || apt.status === 'matriculou'
    ).length;
    const matricularam = filteredAppointments.filter(apt => apt.status === 'matriculou').length;
    const naoCompareceram = filteredAppointments.filter(apt => apt.status === 'nao_compareceu').length;

    const taxaComparecimento = totalAgendados > 0 ? (compareceram / totalAgendados * 100) : 0;
    const taxaMatricula = compareceram > 0 ? (matricularam / compareceram * 100) : 0;
    const taxaConversao = totalAgendados > 0 ? (matricularam / totalAgendados * 100) : 0;

    return {
      totalAgendados,
      compareceram,
      matricularam,
      naoCompareceram,
      taxaComparecimento,
      taxaMatricula,
      taxaConversao
    };
  };

  const getAttendanceStatsByMonth = (schoolId: string, startMonth: string, endMonth: string) => {
    const schoolAppointments = getAppointmentsBySchool(schoolId);
    const result = [];
    
    const start = new Date(startMonth + '-01');
    const end = new Date(endMonth + '-01');
    
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const monthStr = d.toISOString().slice(0, 7); // YYYY-MM format
      const monthStats = getAttendanceStats(schoolId, monthStr);
      result.push({
        month: monthStr,
        ...monthStats
      });
    }
    
    return result;
  };

  const getAttendanceStatsBySeller = (schoolId: string, sellerId: string, month?: string) => {
    const schoolAppointments = getAppointmentsBySchool(schoolId);
    
    // Filtrar por vendedor e mês
    const filteredAppointments = schoolAppointments.filter(apt => {
      const matchesSeller = apt.assignedTo === sellerId;
      if (!month) return matchesSeller;
      
      const aptDate = new Date(apt.date);
      const targetMonth = new Date(month + '-01');
      return matchesSeller && 
             aptDate.getFullYear() === targetMonth.getFullYear() && 
             aptDate.getMonth() === targetMonth.getMonth();
    });

    const totalAgendados = filteredAppointments.length;
    const compareceram = filteredAppointments.filter(apt => 
      apt.status === 'compareceu' || apt.status === 'em_fechamento' || apt.status === 'matriculou'
    ).length;
    const matricularam = filteredAppointments.filter(apt => apt.status === 'matriculou').length;
    const naoCompareceram = filteredAppointments.filter(apt => apt.status === 'nao_compareceu').length;

    const taxaComparecimento = totalAgendados > 0 ? (compareceram / totalAgendados * 100) : 0;
    const taxaMatricula = compareceram > 0 ? (matricularam / compareceram * 100) : 0;
    const taxaConversao = totalAgendados > 0 ? (matricularam / totalAgendados * 100) : 0;

    return {
      totalAgendados,
      compareceram,
      matricularam,
      naoCompareceram,
      taxaComparecimento,
      taxaMatricula,
      taxaConversao
    };
  };

  // Qualification Conversation functions
  const createQualificationConversation = async (data: Omit<QualificationConversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<QualificationConversation | null> => {
    try {
      const newConversation: QualificationConversation = {
        ...data,
        id: `qualification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedConversations = [...qualificationConversations, newConversation];
      setQualificationConversations(updatedConversations);
      localStorage.setItem('crm_qualification_conversations', JSON.stringify(updatedConversations));
      return newConversation;
    } catch (error) {
      console.error('Erro ao criar conversa de qualificação:', error);
      return null;
    }
  };

  const updateQualificationConversation = async (id: string, data: Partial<QualificationConversation>): Promise<boolean> => {
    try {
      const updatedConversations = qualificationConversations.map(c => 
        c.id === id ? { ...c, ...data, updatedAt: new Date() } : c
      );
      setQualificationConversations(updatedConversations);
      localStorage.setItem('crm_qualification_conversations', JSON.stringify(updatedConversations));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar conversa de qualificação:', error);
      return false;
    }
  };

  const getQualificationConversationsBySchool = (schoolId: string): QualificationConversation[] => {
    return qualificationConversations.filter(c => c.schoolId === schoolId);
  };

  const getActiveQualificationConversation = (schoolId: string): QualificationConversation | null => {
    const activeConversations = qualificationConversations.filter(c => 
      c.schoolId === schoolId && c.status === 'active'
    );
    return activeConversations.length > 0 ? activeConversations[activeConversations.length - 1] : null;
  };

  // Follow-up functions
  const createFollowUp = async (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newFollowUp: FollowUp = {
        ...data,
        id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedFollowUps = [...followUps, newFollowUp];
      setFollowUps(updatedFollowUps);
      localStorage.setItem('crm_follow_ups', JSON.stringify(updatedFollowUps));
      return true;
    } catch (error) {
      console.error('Erro ao criar follow-up:', error);
      return false;
    }
  };

  const updateFollowUp = async (id: string, data: Partial<FollowUp>): Promise<boolean> => {
    try {
      const updatedFollowUps = followUps.map(f => 
        f.id === id ? { ...f, ...data, updatedAt: new Date() } : f
      );
      setFollowUps(updatedFollowUps);
      localStorage.setItem('crm_follow_ups', JSON.stringify(updatedFollowUps));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar follow-up:', error);
      return false;
    }
  };

  const deleteFollowUp = async (id: string): Promise<boolean> => {
    try {
      const updatedFollowUps = followUps.filter(f => f.id !== id);
      setFollowUps(updatedFollowUps);
      localStorage.setItem('crm_follow_ups', JSON.stringify(updatedFollowUps));
      return true;
    } catch (error) {
      console.error('Erro ao deletar follow-up:', error);
      return false;
    }
  };

  const getFollowUpsBySchool = (schoolId: string): FollowUp[] => {
    return followUps.filter(f => f.schoolId === schoolId);
  };

  const getFollowUpsByLead = (leadId: string): FollowUp[] => {
    return followUps.filter(f => f.leadId === leadId);
  };

  // Task functions
  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newTask: Task = {
        ...data,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      localStorage.setItem('crm_tasks', JSON.stringify(updatedTasks));
      return true;
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      return false;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>): Promise<boolean> => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task.id === id) {
          return { ...task, ...data, updatedAt: new Date() };
        }
        return task;
      });
      setTasks(updatedTasks);
      localStorage.setItem('crm_tasks', JSON.stringify(updatedTasks));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem('crm_tasks', JSON.stringify(updatedTasks));
      return true;
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
      return false;
    }
  };

  const getTasksBySchool = (schoolId: string): Task[] => {
    return tasks.filter(task => task.schoolId === schoolId);
  };

  const getTasksByDate = (schoolId: string, date: Date): Task[] => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => 
      task.schoolId === schoolId && 
      task.scheduledDate.toISOString().split('T')[0] === dateStr
    );
  };

  const getTasksByDateRange = (schoolId: string, startDate: Date, endDate: Date): Task[] => {
    return tasks.filter(task => 
      task.schoolId === schoolId && 
      task.scheduledDate >= startDate && 
      task.scheduledDate <= endDate
    );
  };

  const getTaskStats = (schoolId: string) => {
    const schoolTasks = getTasksBySchool(schoolId);
    const now = new Date();
    
    const total = schoolTasks.length;
    const pendentes = schoolTasks.filter(task => task.status === 'pendente').length;
    const concluidas = schoolTasks.filter(task => task.status === 'concluido').length;
    const atrasadas = schoolTasks.filter(task => 
      task.status === 'pendente' && task.scheduledDate < now
    ).length;
    
    // Cálculo de performance baseado em tarefas concluídas no prazo
    const tarefasConcluidas = schoolTasks.filter(task => 
      task.status === 'concluido' && task.completedDate
    );
    const tarefasNoPrazo = tarefasConcluidas.filter(task => 
      task.completedDate && task.completedDate <= task.scheduledDate
    ).length;
    
    const performance = tarefasConcluidas.length > 0 
      ? Math.round((tarefasNoPrazo / tarefasConcluidas.length) * 100)
      : 0;
    
    return {
      total,
      pendentes,
      concluidas,
      atrasadas,
      performance
    };
  };

  const getAllTasksForAgenda = (schoolId: string): Task[] => {
    // Combinar tarefas manuais com follow-ups convertidos em tarefas
    const manualTasks = getTasksBySchool(schoolId);
    const followUpTasks: Task[] = getFollowUpsBySchool(schoolId).map(followUp => ({
      id: `followup_${followUp.id}`,
      title: `Follow-up: ${followUp.description}`,
      description: followUp.description,
      type: 'follow_up' as const,
      priority: followUp.priority,
      status: followUp.status,
      scheduledDate: followUp.scheduledDate,
      completedDate: followUp.status === 'concluido' ? followUp.updatedAt : undefined,
      schoolId: followUp.schoolId,
      assignedTo: followUp.assignedTo,
      leadId: followUp.leadId,
      leadName: followUp.leadName,
      category: followUp.type,
      notes: followUp.notes,
      createdAt: followUp.createdAt,
      updatedAt: followUp.updatedAt
    }));
    
    return [...manualTasks, ...followUpTasks].sort((a, b) => 
      a.scheduledDate.getTime() - b.scheduledDate.getTime()
    );
  };

  const getLeadStats = (schoolId: string) => {
    const schoolLeads = getLeadsBySchool(schoolId);
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const leadsHoje = schoolLeads.filter(l => 
      new Date(l.createdAt) >= todayStart
    ).length;
    
    const qualificados = schoolLeads.filter(l => l.status === 'qualificado').length;
    const agendados = schoolLeads.filter(l => l.status === 'agendado').length;
    const fechados = schoolLeads.filter(l => l.status === 'fechado').length;
    const novosLeads = schoolLeads.filter(l => l.status === 'novo').length;
    
    return {
      leadsHoje,
      qualificados,
      agendados,
      fechados,
      novosLeads
    };
  };

  // Função para distribuição equitativa de leads entre vendedores
  const getNextAvailableSeller = (schoolId: string): Seller | null => {
    // Buscar todos os vendedores ativos da escola
    const activeSellers = getSellersBySchool(schoolId).filter(seller => seller.active);
    
    if (activeSellers.length === 0) {
      return null;
    }
    
    if (activeSellers.length === 1) {
      return activeSellers[0];
    }
    
    // Contar leads atribuídos a cada vendedor
    const schoolLeads = getLeadsBySchool(schoolId);
    const sellerLeadCounts = activeSellers.map(seller => ({
      seller,
      leadCount: schoolLeads.filter(lead => lead.assignedTo === seller.id).length
    }));
    
    // Ordenar por menor número de leads atribuídos
    sellerLeadCounts.sort((a, b) => a.leadCount - b.leadCount);
    
    // Retornar o vendedor com menos leads atribuídos
    return sellerLeadCounts[0].seller;
  };

  const value: AuthContextType = {
    user,
    schools,
    sellers,
    leadSources,
    leads,
    appointments,
    qualificationConversations,
    followUps,
    tasks,
    currentSchool,
    isLoading,
    loginAsSchool,
    loginAsSeller,
    logout,
    registerSchool,
    updateSchool,
    deleteSchool,
    registerSeller,
    updateSeller,
    deleteSeller,
    getSellersBySchool,
    registerLeadSource,
    updateLeadSource,
    deleteLeadSource,
    getLeadSourcesBySchool,
    toggleLeadSource,
    recreateDefaultLeadSources,
    registerLead,
    updateLead,
    deleteLead,
    getLeadsBySchool,
    getLeadStats,
    getNextAvailableSeller,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsBySchool,
    getAttendanceStats,
    getAttendanceStatsByMonth,
    getAttendanceStatsBySeller,
    createQualificationConversation,
    updateQualificationConversation,
    getQualificationConversationsBySchool,
    getActiveQualificationConversation,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    getFollowUpsBySchool,
    getFollowUpsByLead,
    createTask,
    updateTask,
    deleteTask,
    getTasksBySchool,
    getTasksByDate,
    getTasksByDateRange,
    getTaskStats,
    getAllTasksForAgenda
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}; 