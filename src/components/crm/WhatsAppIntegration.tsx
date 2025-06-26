
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const WhatsAppIntegration = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  const defaultMessage = `🎯 *Lead Qualificado - CRM Inteligente*

Olá! Identifiquei um lead com alto potencial de conversão:

📊 *Score de Qualificação:* 95/100
👤 *Nome:* [Nome do Lead]
📧 *Email:* [Email do Lead]
🏢 *Empresa:* [Empresa do Lead]

💡 *Resumo da Conversa:*
- Demonstrou interesse em automação de vendas
- Possui orçamento disponível
- Urgência: Alta
- Empresa de médio porte (50+ funcionários)

✅ *Próximos Passos:*
1. Entrar em contato em até 1 hora
2. Agendar demonstração
3. Enviar proposta comercial

*Enviado automaticamente pelo SDR Virtual*`;

  const handleSendWhatsApp = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o número do WhatsApp",
        variant: "destructive",
      });
      return;
    }

    console.log('Enviando WhatsApp:', { phoneNumber, message });
    
    toast({
      title: "Mensagem Enviada!",
      description: "Lead encaminhado com sucesso para o WhatsApp",
    });

    setPhoneNumber('');
    setMessage('');
  };

  const sentMessages = [
    { client: 'Maria Silva', phone: '+55 11 99999-9999', score: 95, sentAt: '10:30' },
    { client: 'João Santos', phone: '+55 11 88888-8888', score: 87, sentAt: '09:15' },
    { client: 'Ana Costa', phone: '+55 11 77777-7777', score: 92, sentAt: '14:45' },
  ];

  return (
    <div className="space-y-6">
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
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <Send className="mr-2" size={18} />
            Enviar para WhatsApp
          </Button>
        </div>
      </Card>

      {/* API Configuration */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuração da API</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { provider: 'Z-API', status: 'Ativo', color: 'bg-green-500' },
            { provider: 'UltraMsg', status: 'Configurar', color: 'bg-yellow-500' },
            { provider: 'Meta Cloud API', status: 'Configurar', color: 'bg-yellow-500' },
          ].map((api, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{api.provider}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${api.color} text-white`}>
                  {api.status}
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                {api.status === 'Ativo' ? 'Funcionando normalmente' : 'Clique para configurar'}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Sent Messages History */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Mensagens Enviadas</h3>
        <div className="space-y-3">
          {sentMessages.map((msg, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-white font-medium">{msg.client}</p>
                  <p className="text-slate-400 text-sm">{msg.phone}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">Score: {msg.score}</p>
                <p className="text-slate-400 text-sm">Enviado às {msg.sentAt}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Template Messages */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Templates de Mensagem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Lead Qualificado', usage: '87%' },
            { name: 'Reunião Agendada', usage: '65%' },
            { name: 'Follow-up', usage: '43%' },
            { name: 'Proposta Enviada', usage: '29%' },
          ].map((template, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{template.name}</span>
                <span className="text-slate-400 text-sm">{template.usage}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  style={{ width: template.usage }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
