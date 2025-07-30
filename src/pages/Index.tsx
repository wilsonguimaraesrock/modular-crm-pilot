import { useState } from 'react';
import { DashboardOverview } from '@/components/crm/DashboardOverview';
import { LeadCapture } from '@/components/crm/LeadCapture';
import { LeadQualification } from '@/components/crm/LeadQualification';
import { CalendarScheduling } from '@/components/crm/CalendarScheduling';
import { AttendanceModule } from '@/components/crm/AttendanceModule';
import { AgendaModule } from '@/components/crm/AgendaModule';
import { ContactsManager } from '@/components/crm/ContactsManager';
import { WhatsAppIntegration } from '@/components/crm/WhatsAppIntegration';
import { AdminPanel } from '@/components/crm/AdminPanel';
import { Navigation } from '@/components/crm/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { RockfellerLogo } from '@/components/ui/logo';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleModuleChange} />;
      case 'leads':
        return <LeadCapture />;
      case 'qualification':
        return <LeadQualification />;
      case 'calendar':
        return <CalendarScheduling />;
      case 'attendance':
        return <AttendanceModule />;
      case 'agenda':
        return <AgendaModule />;
      case 'contacts':
        return <ContactsManager />;
      case 'whatsapp':
        return <WhatsAppIntegration />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <DashboardOverview onNavigate={handleModuleChange} />;
    }
  };

  const handleModuleChange = (module: string) => {
    setActiveModule(module);
    if (isMobile) {
      setIsMenuOpen(false); // Fecha o menu mobile quando navega
    }
  };

  const getModuleTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      leads: 'Captura de Leads', 
      qualification: 'Qualificação IA',
      calendar: 'Agendamento',
      attendance: 'Atendimentos',
      agenda: 'Agenda de Tarefas',
      whatsapp: 'WhatsApp',
      admin: 'Configurações'
    };
    return titles[activeModule as keyof typeof titles] || 'CRM Rockfeller';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="flex h-screen">
        {/* Navigation Desktop */}
        {!isMobile && (
          <Navigation activeModule={activeModule} setActiveModule={handleModuleChange} />
        )}

        {/* Navigation Mobile */}
        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-50 md:hidden bg-slate-800/80 backdrop-blur-sm text-white hover:bg-slate-700/80"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-slate-800/95 backdrop-blur-sm border-slate-700">
              <Navigation 
                activeModule={activeModule} 
                setActiveModule={handleModuleChange}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <main className={`flex-1 flex flex-col overflow-hidden ${
          isMobile ? 'pt-12' : ''
        }`}>
          {/* Header Mobile */}
          {isMobile && (
            <header className="px-4 py-1 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 backdrop-blur-sm border-b border-amber-400/30 fixed top-0 left-0 right-0 z-50 shadow-lg">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center space-x-2 ml-12">
                  <div className="flex items-center space-x-2">
                    <RockfellerLogo size="small" />
                    <div>
                      <h1 className="text-sm font-bold text-white leading-tight">
                        CRM ROCKFELLER
                      </h1>
                      <p className="text-xs text-white/80 -mt-0.5 leading-tight">
                        {getModuleTitle()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </div>
            </header>
          )}

          {/* Header Desktop - COMPACTO */}
          {!isMobile && (
            <header className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 border-b border-amber-400/30 shadow-lg">
              <div className="max-w-7xl mx-auto px-6 py-1.5">
                <div className="flex items-center space-x-2">
                  <RockfellerLogo size="medium" />
                  <div>
                    <h1 className="text-xl font-bold text-white leading-tight">
                      CRM ROCKFELLER
                    </h1>
                    <p className="text-white/90 text-xs leading-tight">
                      Sistema de gestão de leads com IA e integração WhatsApp via WAHA
                    </p>
                  </div>
                </div>
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className={`flex-1 overflow-auto ${
            isMobile ? 'p-4 pt-2' : 'p-6'
          }`}>
            <div className={`${
              isMobile ? 'w-full' : 'max-w-7xl mx-auto'
            }`}>
              {renderActiveModule()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
