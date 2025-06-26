import { useState } from 'react';
import { DashboardOverview } from '@/components/crm/DashboardOverview';
import { LeadCapture } from '@/components/crm/LeadCapture';
import { LeadQualification } from '@/components/crm/LeadQualification';
import { CalendarScheduling } from '@/components/crm/CalendarScheduling';
import { WhatsAppIntegration } from '@/components/crm/WhatsAppIntegration';
import { AdminPanel } from '@/components/crm/AdminPanel';
import { Navigation } from '@/components/crm/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'leads':
        return <LeadCapture />;
      case 'qualification':
        return <LeadQualification />;
      case 'calendar':
        return <CalendarScheduling />;
      case 'whatsapp':
        return <WhatsAppIntegration />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <DashboardOverview />;
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
      whatsapp: 'WhatsApp',
      admin: 'Configurações'
    };
    return titles[activeModule as keyof typeof titles] || 'CRM Inteligente';
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
          isMobile ? 'pt-16' : ''
        }`}>
          {/* Header Mobile */}
          {isMobile && (
            <header className="px-4 py-3 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 fixed top-0 left-0 right-0 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 ml-12">
                  <h1 className="text-lg font-bold text-white truncate">
                    {getModuleTitle()}
                  </h1>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
            </header>
          )}

          {/* Header Desktop */}
          {!isMobile && (
            <header className="p-6 border-b border-slate-700/50">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold text-white mb-2">
                  CRM Inteligente
                </h1>
                <p className="text-slate-300">
                  Sistema de gestão de leads com IA e integração WhatsApp via Chatwoot
                </p>
              </div>
            </header>
          )}

          {/* Content Area */}
          <div className={`flex-1 overflow-auto ${
            isMobile ? 'p-4' : 'p-6'
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
