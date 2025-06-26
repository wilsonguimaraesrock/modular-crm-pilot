
import { useState } from 'react';
import { DashboardOverview } from '@/components/crm/DashboardOverview';
import { LeadCapture } from '@/components/crm/LeadCapture';
import { LeadQualification } from '@/components/crm/LeadQualification';
import { CalendarScheduling } from '@/components/crm/CalendarScheduling';
import { WhatsAppIntegration } from '@/components/crm/WhatsAppIntegration';
import { AdminPanel } from '@/components/crm/AdminPanel';
import { Navigation } from '@/components/crm/Navigation';

const Index = () => {
  const [activeModule, setActiveModule] = useState('dashboard');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        <Navigation activeModule={activeModule} setActiveModule={setActiveModule} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                CRM Inteligente
              </h1>
              <p className="text-slate-300">
                Sistema de gestão de leads com IA e integração WhatsApp
              </p>
            </header>
            {renderActiveModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
