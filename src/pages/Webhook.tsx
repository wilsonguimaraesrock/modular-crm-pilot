import { useEffect, useState } from 'react';
import { WebhookManager } from '@/components/crm/WebhookManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LeadData {
  name: string;
  email: string;
  phone: string;
  interests: string;
  modality: string;
  source?: string;
}

export const Webhook = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastLead, setLastLead] = useState<LeadData | null>(null);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    setIsActive(true);
    
    // Monitor de leads recebidos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalFunction = (window as any).receiveLeadFromLandingPage;
    
    if (originalFunction) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).receiveLeadFromLandingPage = async (leadData: LeadData) => {
        const result = await originalFunction(leadData);
        if (result.success) {
          setLastLead(leadData);
          setLeadsCount(prev => prev + 1);
        }
        return result;
      };
    }

    return () => {
      setIsActive(false);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            🔗 Webhook Rockfeller CRM
          </h1>
          <p className="text-gray-600">
            Endpoint ativo para receber leads da landing page
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Status do Webhook */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {isActive ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-500" />
                    Status: Ativo
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-500" />
                    Status: Inativo
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge 
                variant={isActive ? "default" : "destructive"}
                className="mb-2"
              >
                {isActive ? 'ONLINE' : 'OFFLINE'}
              </Badge>
              <p className="text-sm text-gray-600">
                Webhook configurado para receber leads da landing page V0
              </p>
            </CardContent>
          </Card>

          {/* Contador de Leads */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                Leads Recebidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {leadsCount}
              </div>
              <p className="text-sm text-gray-600">
                Total de leads processados nesta sessão
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Último Lead Recebido */}
        {lastLead && (
          <Card className="border-l-4 border-l-orange-500 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Último Lead Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Nome:</strong> {lastLead.name}</p>
                  <p><strong>Email:</strong> {lastLead.email}</p>
                  <p><strong>WhatsApp:</strong> {lastLead.phone}</p>
                </div>
                <div>
                  <p><strong>Interesse:</strong> {lastLead.interests}</p>
                  <p><strong>Modalidade:</strong> {lastLead.modality}</p>
                  <p><strong>Fonte:</strong> {lastLead.source || 'Landing Page V0'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instruções de Integração */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Instruções de Integração</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Via JavaScript Global:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Na sua landing page V0, adicione:
window.receiveLeadFromLandingPage({
  name: "João Silva",
  email: "joao@email.com", 
  phone: "(47) 99999-9999",
  interests: "Inglês Adults",
  modality: "Presencial",
  source: "google-ads"
});`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Via PostMessage:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Na sua landing page V0:
window.parent.postMessage({
  type: 'ROCKFELLER_LEAD',
  lead: {
    name: "João Silva",
    email: "joao@email.com",
    phone: "(47) 99999-9999", 
    interests: "Inglês Adults",
    modality: "Presencial",
    source: "facebook-ads"
  }
}, '*');`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Componente Webhook Manager */}
        <WebhookManager />
      </div>
    </div>
  );
}; 