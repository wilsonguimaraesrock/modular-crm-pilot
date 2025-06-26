
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Send, 
  Settings 
} from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
}

export const Navigation = ({ activeModule, setActiveModule }: NavigationProps) => {
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Users },
    { id: 'leads', name: 'Captura de Leads', icon: Users },
    { id: 'qualification', name: 'Qualificação IA', icon: MessageSquare },
    { id: 'calendar', name: 'Agendamento', icon: Calendar },
    { id: 'whatsapp', name: 'WhatsApp', icon: Send },
    { id: 'admin', name: 'Configurações', icon: Settings },
  ];

  return (
    <nav className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 p-4">
      <div className="space-y-2">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="font-medium">{module.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
