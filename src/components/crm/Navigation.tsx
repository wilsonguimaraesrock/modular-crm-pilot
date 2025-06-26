
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Send, 
  Settings,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3, notifications: 0 },
    { id: 'leads', name: 'Captura de Leads', icon: Users, notifications: 3 },
    { id: 'qualification', name: 'Qualificação IA', icon: MessageSquare, notifications: 7 },
    { id: 'calendar', name: 'Agendamento', icon: Calendar, notifications: 2 },
    { id: 'whatsapp', name: 'WhatsApp', icon: Send, notifications: 1 },
    { id: 'admin', name: 'Configurações', icon: Settings, notifications: 0 },
  ];

  const container = {
    hidden: { opacity: 0, x: -50 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <TooltipProvider>
      <motion.nav 
        className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 p-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <div className="space-y-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">CRM Inteligente</h2>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-slate-400 mt-1">75% das metas atingidas</p>
          </div>

          {modules.map((module, index) => {
            const Icon = module.icon;
            const isActive = activeModule === module.id;
            
            return (
              <motion.div key={module.id} variants={item}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setActiveModule(module.id)}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-12 transition-all duration-300 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
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
              </motion.div>
            );
          })}
        </div>

        {/* Status Online */}
        <motion.div 
          className="mt-8 p-3 bg-slate-700/30 rounded-lg border border-slate-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-300">Sistema Online</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Última sync: agora</p>
        </motion.div>
      </motion.nav>
    </TooltipProvider>
  );
};
