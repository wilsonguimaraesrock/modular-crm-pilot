import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Send, 
  Settings,
  BarChart3,
  LogOut,
  Building,
  User,
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isMobile?: boolean;
}

export const Navigation = ({ activeModule, setActiveModule, isMobile = false }: NavigationProps) => {
  const { user, logout } = useAuth();
  
  // Filtrar módulos baseado no tipo de usuário
  const allModules = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, notifications: 0, allowedTypes: ['school', 'seller'] },
    { id: 'leads', name: 'Captura de Leads', icon: Users, notifications: 0, allowedTypes: ['school', 'seller'] },
    { id: 'qualification', name: 'Qualificação IA', icon: MessageSquare, notifications: 0, allowedTypes: ['school', 'seller'] },
    { id: 'calendar', name: 'Agendamento', icon: Calendar, notifications: 0, allowedTypes: ['school', 'seller'] },
    { id: 'agenda', name: 'Agenda de Tarefas', icon: CalendarDays, notifications: 0, allowedTypes: ['school', 'seller'] },
    { id: 'whatsapp', name: 'WhatsApp', icon: Send, notifications: 0, allowedTypes: ['school'] },
    { id: 'admin', name: 'Configurações', icon: Settings, notifications: 0, allowedTypes: ['school'] },
  ];

  const modules = allModules.filter(module => 
    user && module.allowedTypes.includes(user.type)
  );

  const container = {
    hidden: { opacity: 0, x: isMobile ? 0 : -50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: isMobile ? 0 : -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <TooltipProvider>
      <motion.nav 
        className={`${
          isMobile 
            ? 'w-full h-full bg-slate-800/95 backdrop-blur-sm p-4'
            : 'w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 p-4'
        }`}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="space-y-2">
          {/* Header */}
          <div className={`${isMobile ? 'mb-6' : 'mb-4'}`}>
            <h2 className={`${
              isMobile ? 'text-xl' : 'text-lg'
            } font-semibold text-white mb-2`}>
              CRM Inteligente
            </h2>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-full"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Sistema operacional</p>
          </div>

          {/* User/School Info - Moved to top */}
          <motion.div 
            className={`${
              isMobile ? 'mb-6' : 'mb-4'
            } p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg border border-blue-500/30`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-1">
              {user?.type === 'school' ? (
                <Building className="w-4 h-4 text-blue-400" />
              ) : (
                <User className="w-4 h-4 text-purple-400" />
              )}
              <span className={`${
                isMobile ? 'text-sm' : 'text-sm'
              } text-white font-semibold`}>
                {user?.type === 'school' && user?.name ? user.name : user?.school?.name || 'Escola'}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className={`${
                isMobile ? 'text-xs' : 'text-xs'
              } text-slate-300`}>
                {user?.type === 'school' ? 'Administrador' : `Vendedor - ${user?.name || 'Usuário'}`}
              </p>
            </div>
          </motion.div>

          {/* Menu Items */}
          {modules.map((module, index) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <motion.div key={module.id} variants={item}>
                {!isMobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setActiveModule(module.id)}
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start h-12 transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                            : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:scale-105'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <Icon size={18} />
                            <span className="font-medium">{module.name}</span>
                          </div>
                          {module.notifications > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="h-5 w-5 p-0 text-xs flex items-center justify-center animate-pulse"
                            >
                              {module.notifications}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{module.name}</p>
                      {module.notifications > 0 && (
                        <p className="text-xs text-red-400">{module.notifications} notificações</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  // Mobile version without tooltip
                  <Button
                    onClick={() => setActiveModule(module.id)}
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-14 transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-4">
                        <Icon size={20} />
                        <span className="font-medium text-base">{module.name}</span>
                      </div>
                      {module.notifications > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="h-6 w-6 p-0 text-xs flex items-center justify-center animate-pulse"
                        >
                          {module.notifications}
                        </Badge>
                      )}
                    </div>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>



        {/* Status Online */}
        <motion.div 
          className={`${
            isMobile ? 'mt-4' : 'mt-4'
          } p-3 bg-slate-700/30 rounded-lg border border-slate-600`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className={`${
              isMobile ? 'text-sm' : 'text-xs'
            } text-slate-300`}>
              Sistema Online
            </span>
          </div>
          <p className={`${
            isMobile ? 'text-sm' : 'text-xs'
          } text-slate-400 mt-1`}>
            Pronto para dados reais
          </p>
        </motion.div>

        {/* Logout Button */}
        <motion.div 
          className={`${
            isMobile ? 'mt-4' : 'mt-4'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={logout}
            variant="ghost"
            className={`w-full justify-start ${
              isMobile ? 'h-12' : 'h-10'
            } text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300`}
          >
            <LogOut className={`${
              isMobile ? 'mr-3' : 'mr-2'
            }`} size={isMobile ? 18 : 16} />
            <span className={`font-medium ${
              isMobile ? 'text-base' : 'text-sm'
            }`}>
              Sair
            </span>
          </Button>
        </motion.div>

        {/* Mobile Footer */}
        {isMobile && (
          <motion.div 
            className="mt-8 p-4 border-t border-slate-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-xs text-slate-400 text-center">
              © 2024 CRM Inteligente
            </p>
          </motion.div>
        )}
      </motion.nav>
    </TooltipProvider>
  );
};
