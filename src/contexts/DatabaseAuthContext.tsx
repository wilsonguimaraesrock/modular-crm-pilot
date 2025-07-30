'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  type: 'school' | 'seller';
  firstLoginCompleted: boolean;
  schoolId: string;
  school?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt: string;
  };
  role?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  schoolId: string;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  followUps?: FollowUp[];
}

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  type: string;
  priority: string;
  description: string;
  scheduledDate: string;
  status: string;
  notes?: string;
  schoolId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  scheduledDate: string;
  completedDate?: string;
  schoolId: string;
  assignedTo?: string;
  leadId?: string;
  leadName?: string;
  category?: string;
  estimatedTime?: number;
  actualTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  lead?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  date: string;
  time: string;
  type: string;
  status: string;
  schoolId: string;
  assignedTo?: string;
  notes?: string;
  meetingLink?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  lead?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  schoolId: string;
  active: boolean;
  createdAt: string;
}

export interface LeadSource {
  id: string;
  name: string;
  type: string;
  icon: string;
  active: boolean;
  url?: string;
  description: string;
  fields: any;
  autoAssign?: string;
  notifications: boolean;
  webhookUrl?: string;
  leadsCount: number;
  schoolId: string;
  createdAt: string;
}

interface DatabaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  loginAsSchool: (email: string, password: string) => Promise<boolean>;
  loginAsSeller: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Lead functions
  getLeadsBySchool: (schoolId: string) => Lead[];
  registerLead: (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateLead: (id: string, data: Partial<Lead>) => Promise<boolean>;
  getLeadStats: (schoolId: string) => {
    total: number;
    novos: number;
    emAndamento: number;
    qualificados: number;
    convertidos: number;
  };
  getLeadSourcesBySchool: (schoolId: string) => LeadSource[];
  
  // FollowUp functions
  createFollowUp: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  getFollowUpsByLead: (leadId: string) => FollowUp[];
  updateFollowUp: (id: string, data: Partial<FollowUp>) => Promise<boolean>;
  deleteFollowUp: (id: string) => Promise<boolean>;
  
  // Task functions
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  getAllTasksForAgenda: (schoolId: string) => Task[];
  getTaskStats: (schoolId: string) => {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  
  // Appointment functions
  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  getAppointmentsBySchool: (schoolId: string) => Appointment[];
  updateAppointment: (id: string, data: Partial<Appointment>) => Promise<boolean>;
  
  // Seller functions
  getSellersBySchool: (schoolId: string) => Seller[];
  
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
  
  // Data state
  leads: Lead[];
  followUps: FollowUp[];
  tasks: Task[];
  appointments: Appointment[];
  sellers: Seller[];
  leadSources: LeadSource[];
  
  // Refresh function
  refreshData: () => Promise<void>;
}

const DatabaseAuthContext = createContext<DatabaseAuthContextType | undefined>(undefined);

export const useDatabaseAuth = () => {
  const context = useContext(DatabaseAuthContext);
  if (context === undefined) {
    throw new Error('useDatabaseAuth deve ser usado dentro de um DatabaseAuthProvider');
  }
  return context;
};

interface DatabaseAuthProviderProps {
  children: ReactNode;
}

/**
 * MIGRAÇÃO VITE → NEXT.JS - CONTEXTO DE DADOS
 * 
 * PROBLEMA ORIGINAL:
 * - O contexto usava Prisma diretamente no cliente
 * - Next.js não permite uso direto do Prisma no lado do cliente
 * - Isso causava erros de "PrismaClient is not defined"
 * 
 * SOLUÇÃO IMPLEMENTADA:
 * - Removido uso direto do Prisma
 * - Implementado fetch para API Routes (/api/data)
 * - Mantida toda a funcionalidade de CRUD
 * 
 * MUDANÇAS:
 * - Antes: Prisma no cliente (não funcionava no Next.js)
 * - Depois: fetch para /api/data + localStorage para cache
 * 
 * BENEFÍCIOS:
 * - Compatibilidade com Next.js
 * - Melhor separação cliente/servidor
 * - Mantém todas as funcionalidades do CRM
 * - Melhor performance (dados carregados uma vez)
 */

export const DatabaseAuthProvider: React.FC<DatabaseAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSource[]>([]);

  // Check if user is logged in on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const loginAsSchool = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'school' })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const loginAsSeller = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, type: 'seller' })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setLeads([]);
    setFollowUps([]);
    setTasks([]);
    setAppointments([]);
    setSellers([]);
    setLeadSources([]);
  };

  const getLeadsBySchool = (schoolId: string): Lead[] => {
    return leads.filter(lead => lead.schoolId === schoolId);
  };

  const registerLead = async (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newLead = await response.json();
        setLeads(prev => [...prev, newLead]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao registrar lead:', error);
      return false;
    }
  };

  const updateLead = async (id: string, data: Partial<Lead>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedLead = await response.json();
        setLeads(prev => prev.map(lead => lead.id === id ? updatedLead : lead));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      return false;
    }
  };

  const getLeadStats = (schoolId: string) => {
    const schoolLeads = getLeadsBySchool(schoolId);
    return {
      total: schoolLeads.length,
      novos: schoolLeads.filter(lead => lead.status === 'novo').length,
      emAndamento: schoolLeads.filter(lead => lead.status === 'em_andamento').length,
      qualificados: schoolLeads.filter(lead => lead.status === 'qualificado').length,
      convertidos: schoolLeads.filter(lead => lead.status === 'convertido').length
    };
  };

  const getLeadSourcesBySchool = (schoolId: string): LeadSource[] => {
    return leadSources.filter(source => source.schoolId === schoolId);
  };

  const createFollowUp = async (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newFollowUp = await response.json();
        setFollowUps(prev => [...prev, newFollowUp]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar follow-up:', error);
      return false;
    }
  };

  const getFollowUpsByLead = (leadId: string): FollowUp[] => {
    return followUps.filter(followUp => followUp.leadId === leadId);
  };

  const updateFollowUp = async (id: string, data: Partial<FollowUp>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/follow-ups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedFollowUp = await response.json();
        setFollowUps(prev => prev.map(followUp => followUp.id === id ? updatedFollowUp : followUp));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar follow-up:', error);
      return false;
    }
  };

  const deleteFollowUp = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/follow-ups/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFollowUps(prev => prev.filter(followUp => followUp.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar follow-up:', error);
      return false;
    }
  };

  const createTask = async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [...prev, newTask]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar task:', error);
      return false;
    }
  };

  const updateTask = async (id: string, data: Partial<Task>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar task:', error);
      return false;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao deletar task:', error);
      return false;
    }
  };

  const getAllTasksForAgenda = (schoolId: string): Task[] => {
    return tasks.filter(task => task.schoolId === schoolId);
  };

  const getTaskStats = (schoolId: string) => {
    const schoolTasks = getAllTasksForAgenda(schoolId);
    const now = new Date();
    
    return {
      total: schoolTasks.length,
      completed: schoolTasks.filter(task => task.status === 'concluida').length,
      pending: schoolTasks.filter(task => task.status === 'pendente').length,
      overdue: schoolTasks.filter(task => 
        task.status === 'pendente' && new Date(task.scheduledDate) < now
      ).length
    };
  };

  const createAppointment = async (data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        setAppointments(prev => [...prev, newAppointment]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao criar appointment:', error);
      return false;
    }
  };

  const getAppointmentsBySchool = (schoolId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.schoolId === schoolId);
  };

  const updateAppointment = async (id: string, data: Partial<Appointment>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const updatedAppointment = await response.json();
        setAppointments(prev => prev.map(appointment => appointment.id === id ? updatedAppointment : appointment));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar appointment:', error);
      return false;
    }
  };

  const getSellersBySchool = (schoolId: string): Seller[] => {
    return sellers.filter(seller => seller.schoolId === schoolId);
  };

  const getAttendanceStats = (schoolId: string, month?: string) => {
    const schoolAppointments = getAppointmentsBySchool(schoolId);
    const totalAgendados = schoolAppointments.length;
    const compareceram = schoolAppointments.filter(apt => apt.status === 'compareceu').length;
    const matricularam = schoolAppointments.filter(apt => apt.status === 'matriculou').length;
    const naoCompareceram = schoolAppointments.filter(apt => apt.status === 'nao_compareceu').length;
    
    return {
      totalAgendados,
      compareceram,
      matricularam,
      naoCompareceram,
      taxaComparecimento: totalAgendados > 0 ? (compareceram / totalAgendados) * 100 : 0,
      taxaMatricula: totalAgendados > 0 ? (matricularam / totalAgendados) * 100 : 0,
      taxaConversao: compareceram > 0 ? (matricularam / compareceram) * 100 : 0
    };
  };

  // MIGRAÇÃO: Função de refresh atualizada para usar API Routes
  const refreshData = async () => {
    if (!user) return;
    
    try {
      // Carrega todos os dados via API Route
      const response = await fetch('/api/data');
      
      if (response.ok) {
        const data = await response.json();
        
        // Atualiza o estado com os dados recebidos
        setLeads(data.leads || []);
        setTasks(data.tasks || []);
        setAppointments(data.appointments || []);
        setSellers(data.sellers || []);
        setLeadSources(data.leadSources || []);
        setFollowUps(data.followUps || []);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    }
  };

  // Load data when user changes
  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const value: DatabaseAuthContextType = {
    user,
    isLoading,
    loginAsSchool,
    loginAsSeller,
    logout,
    getLeadsBySchool,
    registerLead,
    updateLead,
    getLeadStats,
    getLeadSourcesBySchool,
    createFollowUp,
    getFollowUpsByLead,
    updateFollowUp,
    deleteFollowUp,
    createTask,
    updateTask,
    deleteTask,
    getAllTasksForAgenda,
    getTaskStats,
    createAppointment,
    getAppointmentsBySchool,
    updateAppointment,
    getSellersBySchool,
    getAttendanceStats,
    leads,
    followUps,
    tasks,
    appointments,
    sellers,
    leadSources,
    refreshData
  };

  return (
    <DatabaseAuthContext.Provider value={value}>
      {children}
    </DatabaseAuthContext.Provider>
  );
}; 