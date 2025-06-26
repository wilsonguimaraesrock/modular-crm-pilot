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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data - em produção, isso viria de uma API/banco de dados
const MOCK_SCHOOLS: School[] = [
  {
    id: '1',
    name: 'Escola Rockfeller Sede',
    email: 'admin@rockfeller.com.br',
    phone: '+55 11 9999-9999',
    address: 'Av. Paulista, 1000 - São Paulo/SP',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Escola Rockfeller Filial Norte',
    email: 'norte@rockfeller.com.br',
    phone: '+55 11 8888-8888',
    address: 'Rua Augusta, 500 - São Paulo/SP',
    createdAt: new Date('2024-02-01')
  }
];

const MOCK_SELLERS: Seller[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    email: 'carlos@rockfeller.com.br',
    phone: '+55 11 99999-1111',
    role: 'Vendedor Senior',
    schoolId: '1',
    active: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Ana Santos',
    email: 'ana@rockfeller.com.br',
    phone: '+55 11 99999-2222',
    role: 'Vendedora Pleno',
    schoolId: '1',
    active: true,
    createdAt: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@rockfeller-norte.com.br',
    phone: '+55 11 99999-3333',
    role: 'Vendedor Junior',
    schoolId: '2',
    active: true,
    createdAt: new Date('2024-02-10')
  }
];

// Senhas mock (em produção, usar hash/criptografia)
const MOCK_PASSWORDS: Record<string, string> = {
  'admin@rockfeller.com.br': 'admin123',
  'norte@rockfeller.com.br': 'norte123',
  'carlos@rockfeller.com.br': 'carlos123',
  'ana@rockfeller.com.br': 'ana123',
  'pedro@rockfeller-norte.com.br': 'pedro123'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [schools, setSchools] = useState<School[]>(MOCK_SCHOOLS);
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);
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
      if (!school || MOCK_PASSWORDS[email] !== password) {
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
      if (!seller || MOCK_PASSWORDS[email] !== password) {
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

      setSchools(prev => [...prev, newSchool]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar escola:', error);
      return false;
    }
  };

  const updateSchool = async (id: string, data: Partial<School>): Promise<boolean> => {
    try {
      setSchools(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      return false;
    }
  };

  const deleteSchool = async (id: string): Promise<boolean> => {
    try {
      setSchools(prev => prev.filter(s => s.id !== id));
      setSellers(prev => prev.filter(s => s.schoolId !== id));
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

      setSellers(prev => [...prev, newSeller]);
      return true;
    } catch (error) {
      console.error('Erro ao cadastrar vendedor:', error);
      return false;
    }
  };

  const updateSeller = async (id: string, data: Partial<Seller>): Promise<boolean> => {
    try {
      setSellers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      return false;
    }
  };

  const deleteSeller = async (id: string): Promise<boolean> => {
    try {
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

  const value: AuthContextType = {
    user,
    schools,
    sellers,
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
    getSellersBySchool
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