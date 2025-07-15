import React, { createContext, useContext, useState, useEffect } from 'react';
import { PrismaClient } from '@prisma/client';
import { connectDatabase, prisma } from '@/lib/database';

// Reusando as interfaces existentes mas adaptadas para Prisma
export interface School {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
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
  type: string;
  icon: string;
  active: boolean;
  url: string | null;
  description: string;
  fields: any; // JSON
  autoAssign: string | null;
  notifications: boolean;
  webhookUrl: string | null;
  leadsCount: number;
  schoolId: string;
  createdAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string | null;
  position?: string | null;
  interests?: string | null;
  source: string;
  method: string;
  modality: string;
  age?: string | null;
  experience?: string | null;
  availability?: string | null;
  budget?: string | null;
  goals?: string | null;
  score: number;
  status: string;
  schoolId: string;
  assignedTo?: string | null;
  sourceId?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone?: string | null;
  leadEmail?: string | null;
  date: string;
  time: string;
  type: string;
  status: string;
  schoolId: string;
  assignedTo?: string | null;
  notes?: string | null;
  meetingLink?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualificationConversation {
  id: string;
  leadName: string;
  leadPhone?: string | null;
  leadEmail?: string | null;
  messages: any; // JSON
  stage: number;
  score: number;
  stageScores: any; // JSON
  schoolId: string;
  assignedSeller?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  type: string;
  priority: string;
  description: string;
  scheduledDate: Date;
  status: string;
  notes?: string | null;
  schoolId: string;
  assignedTo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: Date;
  completedDate?: Date | null;
  schoolId: string;
  assignedTo?: string | null;
  leadId?: string | null;
  leadName?: string | null;
  category?: string | null;
  estimatedTime?: number | null;
  actualTime?: number | null;
  notes?: string | null;
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

interface DatabaseAuthContextType {
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
  
  // Other functions similar to original context...
  refreshData: () => Promise<void>;
}

const DatabaseAuthContext = createContext<DatabaseAuthContextType | undefined>(undefined);

// Senhas padrão (em produção, usar hash)
const PASSWORDS: Record<string, string> = {
  'admin@rockfeller.com.br': 'admin123',
  'ricardo@rockfeller.com.br': 'ricardo123',
  'admin@navegantes.com.br': 'navegantes123',
  'tatiana.direito@hotmail.com': 'tatiana123'
};

export const DatabaseAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [qualificationConversations, setQualificationConversations] = useState<QualificationConversation[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentSchool = user?.school || null;

  // Função para carregar todos os dados do banco
  const refreshData = async () => {
    try {
      setIsLoading(true);
      
      // Conectar ao banco
      await connectDatabase();
      
      // Carregar todos os dados
      const [
        schoolsData,
        sellersData,
        leadSourcesData,
        leadsData,
        appointmentsData,
        conversationsData,
        followUpsData,
        tasksData
      ] = await Promise.all([
        prisma.school.findMany(),
        prisma.seller.findMany(),
        prisma.leadSource.findMany(),
        prisma.lead.findMany(),
        prisma.appointment.findMany(),
        prisma.qualificationConversation.findMany(),
        prisma.followUp.findMany(),
        prisma.task.findMany()
      ]);

      setSchools(schoolsData);
      setSellers(sellersData);
      setLeadSources(leadSourcesData);
      setLeads(leadsData);
      setAppointments(appointmentsData);
      setQualificationConversations(conversationsData);
      setFollowUps(followUpsData);
      setTasks(tasksData);
      
      console.log('✅ Dados carregados do banco MySQL');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do banco:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      await refreshData();
      
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
    };

    initializeAuth();
  }, []);

  // Login functions
  const loginAsSchool = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const school = schools.find(s => s.email === email);
      if (!school || PASSWORDS[email] !== password) {
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
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const seller = sellers.find(s => s.email === email && s.active);
      if (!seller || PASSWORDS[email] !== password) {
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

  // CRUD functions for Schools
  const registerSchool = async (data: Omit<School, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newSchool = await prisma.school.create({
        data: {
          ...data,
          phone: data.phone || null,
          address: data.address || null
        }
      });
      
      setSchools(prev => [...prev, newSchool]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar escola:', error);
      return false;
    }
  };

  const updateSchool = async (id: string, data: Partial<School>): Promise<boolean> => {
    try {
      const updatedSchool = await prisma.school.update({
        where: { id },
        data
      });
      
      setSchools(prev => prev.map(s => s.id === id ? updatedSchool : s));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      return false;
    }
  };

  const deleteSchool = async (id: string): Promise<boolean> => {
    try {
      await prisma.school.delete({ where: { id } });
      setSchools(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar escola:', error);
      return false;
    }
  };

  // CRUD functions for Sellers
  const registerSeller = async (data: Omit<Seller, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newSeller = await prisma.seller.create({ data });
      setSellers(prev => [...prev, newSeller]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar vendedor:', error);
      return false;
    }
  };

  const updateSeller = async (id: string, data: Partial<Seller>): Promise<boolean> => {
    try {
      const updatedSeller = await prisma.seller.update({
        where: { id },
        data
      });
      
      setSellers(prev => prev.map(s => s.id === id ? updatedSeller : s));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      return false;
    }
  };

  const deleteSeller = async (id: string): Promise<boolean> => {
    try {
      await prisma.seller.delete({ where: { id } });
      setSellers(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar vendedor:', error);
      return false;
    }
  };

  const getSellersBySchool = (schoolId: string): Seller[] => {
    return sellers.filter(s => s.schoolId === schoolId);
  };

  // CRUD functions for Lead Sources
  const registerLeadSource = async (data: Omit<LeadSource, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const newLeadSource = await prisma.leadSource.create({
        data: {
          ...data,
          url: data.url || null,
          autoAssign: data.autoAssign || null,
          webhookUrl: data.webhookUrl || null
        }
      });
      
      setLeadSources(prev => [...prev, newLeadSource]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar fonte de lead:', error);
      return false;
    }
  };

  const updateLeadSource = async (id: string, data: Partial<LeadSource>): Promise<boolean> => {
    try {
      const updatedLeadSource = await prisma.leadSource.update({
        where: { id },
        data
      });
      
      setLeadSources(prev => prev.map(ls => ls.id === id ? updatedLeadSource : ls));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar fonte de lead:', error);
      return false;
    }
  };

  const deleteLeadSource = async (id: string): Promise<boolean> => {
    try {
      await prisma.leadSource.delete({ where: { id } });
      setLeadSources(prev => prev.filter(ls => ls.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar fonte de lead:', error);
      return false;
    }
  };

  const getLeadSourcesBySchool = (schoolId: string): LeadSource[] => {
    return leadSources.filter(ls => ls.schoolId === schoolId);
  };

  const toggleLeadSource = async (id: string): Promise<boolean> => {
    try {
      const leadSource = leadSources.find(ls => ls.id === id);
      if (!leadSource) return false;

      const updated = await prisma.leadSource.update({
        where: { id },
        data: { active: !leadSource.active }
      });

      setLeadSources(prev => prev.map(ls => ls.id === id ? updated : ls));
      return true;
    } catch (error) {
      console.error('Erro ao alternar fonte de lead:', error);
      return false;
    }
  };

  // CRUD functions for Leads
  const registerLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newLead = await prisma.lead.create({
        data: {
          ...data,
          company: data.company || null,
          position: data.position || null,
          interests: data.interests || null,
          age: data.age || null,
          experience: data.experience || null,
          availability: data.availability || null,
          budget: data.budget || null,
          goals: data.goals || null,
          assignedTo: data.assignedTo || null,
          sourceId: data.sourceId || null,
          notes: data.notes || null
        }
      });
      
      setLeads(prev => [...prev, newLead]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar lead:', error);
      return false;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<boolean> => {
    try {
      const updatedLead = await prisma.lead.update({
        where: { id },
        data
      });
      
      setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      return false;
    }
  };

  const deleteLead = async (id: string): Promise<boolean> => {
    try {
      await prisma.lead.delete({ where: { id } });
      setLeads(prev => prev.filter(l => l.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar lead:', error);
      return false;
    }
  };

  const getLeadsBySchool = (schoolId: string): Lead[] => {
    return leads.filter(l => l.schoolId === schoolId);
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

  // CRUD functions for Appointments
  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const newAppointment = await prisma.appointment.create({
        data: {
          ...data,
          leadPhone: data.leadPhone || null,
          leadEmail: data.leadEmail || null,
          assignedTo: data.assignedTo || null,
          notes: data.notes || null,
          meetingLink: data.meetingLink || null,
          address: data.address || null
        }
      });
      
      setAppointments(prev => [...prev, newAppointment]);
      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return false;
    }
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<boolean> => {
    try {
      const updatedAppointment = await prisma.appointment.update({
        where: { id },
        data
      });
      
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      return false;
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      await prisma.appointment.delete({ where: { id } });
      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
      return false;
    }
  };

  const getAppointmentsBySchool = (schoolId: string): Appointment[] => {
    return appointments.filter(a => a.schoolId === schoolId);
  };

  // Attendance statistics
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

  const value: DatabaseAuthContextType = {
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
    registerLead,
    updateLead,
    deleteLead,
    getLeadsBySchool,
    getLeadStats,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsBySchool,
    getAttendanceStats,
    refreshData
  };

  return (
    <DatabaseAuthContext.Provider value={value}>
      {children}
    </DatabaseAuthContext.Provider>
  );
};

export const useDatabaseAuth = (): DatabaseAuthContextType => {
  const context = useContext(DatabaseAuthContext);
  if (context === undefined) {
    throw new Error('useDatabaseAuth deve ser usado dentro de um DatabaseAuthProvider');
  }
  return context;
}; 