
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppIntegration = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [chatwootConfig, setChatwootConfig] = useState({
    url: '',
    token: '',
    inboxId: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const defaultMessage = `🎯 *Lead Qualificado - CRM Inteligente*

Olá! Identifiquei um lead com alto potencial de conversão através do nosso sistema de IA.

📊 *Informações do Lead:*
- Score de Qualificação: [Score]/100
- Nome: [Nome do Lead]
- Email: [Email do Lead]
- Telefone: [Telefone do Lead]

💡 *Próximos Passos:*
1. Entrar em contato em até 1 hora
2. Agendar demonstração
3. Enviar proposta comercial

*Enviado automaticamente pelo CRM Inteligente*`;

  const handleSendWhatsApp = async () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o número do WhatsApp",
        variant: "destructive",
      });
      return;
    }

    if (!isConfigured) {
      toast({
        title: "Configuração necessária",
        description: "Configure o Chatwoot primeiro",
        variant: "destructive",
      });
      return;
    }

    try {
      // Chatwoot API call
      const response = await fetch(`${chatwootConfig.url}/api/v1/accounts/1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api_access_token': chatwootConfig.token
        },
        body: JSON.stringify({
          content: message || defaultMessage,
          message_type: 'outgoing',
          phone_number: phoneNumber,
          inbox_id: chatwootConfig.inboxId
        })
      });

      if (response.ok) {
        toast({
          title: "Mensagem Enviada!",
          description: "Lead encaminhado com sucesso via Chatwoot",
        });
        setPhoneNumber('');
        setMessage('');
      } else {
        throw new Error('Erro na API do Chatwoot');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Verifique as configurações.",
        variant: "destructive",
      });
    }
  };

  const handleConfigureChatwoot = () => {
    if (!chatwootConfig.url || !chatwootConfig.token || !chatwootConfig.inboxId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos de configuração",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfigured(true);
    toast({
      title: "Configurado!",
      description: "Chatwoot configurado com sucesso",
    });
  };

  return (
    <div className="space-y-6">
      {/* Chatwoot Configuration */}
      {!isConfigured && (
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 border-blue-500/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Configurar Chatwoot</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                onClick={() => window.open('https://chatwoot.com', '_blank')}
              >
                <ExternalLink className="mr-2" size={16} />
                Chatwoot.com
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chatwoot-url" className="text-slate-300">URL do Chatwoot</Label>
                <Input
                  id="chatwoot-url"
                  value={chatwootConfig.url}
                  onChange={(e) => setChatwootConfig({...chatwootConfig, url: e.target.value})}
                  placeholder="https://app.chatwoot.com"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chatwoot-token" className="text-slate-300">API Token</Label>
                <Input
                  id="chatwoot-token"
                  type="password"
                  value={chatwootConfig.token}
                  onChange={(e) => setChatwootConfig({...chatwootConfig, token: e.target.value})}
                  placeholder="seu-api-token"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inbox-id" className="text-slate-300">Inbox ID</Label>
                <Input
                  id="inbox-id"
                  value={chatwootConfig.inboxId}
                  onChange={(e) => setChatwootConfig({...chatwootConfig, inboxId: e.target.value})}
                  placeholder="1"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Button
              onClick={handleConfigureChatwoot}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Configurar Chatwoot
            </Button>
          </div>
        </Card>
      )}

      {/* Send Message Form */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-6">Envio para WhatsApp</h2>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="phone" className="text-slate-300">Número do WhatsApp *</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+55 11 99999-9999"
              className="bg-slate-700/50 border-slate-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-slate-300">Mensagem</Label>
            <Textarea
              id="message"
              value={message || defaultMessage}
              onChange={(e) => setMessage(e.target.value)}
              rows={12}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Mensagem será enviada..."
            />
          </div>
          
          <Button
            onClick={handleSendWhatsApp}
            disabled={!isConfigured}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            <Send className="mr-2" size={18} />
            Enviar via Chatwoot
          </Button>
        </div>
      </Card>

      {/* Integration Status */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Status das Integrações</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <MessageSquare className="text-white" size={18} />
              </div>
              <div>
                <p className="text-white font-medium">Chatwoot</p>
                <p className="text-slate-400 text-sm">Plataforma de comunicação</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-3 py-1 rounded-full text-xs ${
                isConfigured 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}>
                {isConfigured ? 'Configurado' : 'Pendente'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Como Configurar</h3>
        <div className="space-y-3 text-slate-300">
          <div className="flex items-start space-x-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            <p>Crie uma conta no Chatwoot (chatwoot.com)</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            <p>Configure um Inbox do tipo WhatsApp</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            <p>Obtenha seu API Token em Profile Settings → Access Token</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
            <p>Anote o ID do seu Inbox (disponível nas configurações)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
