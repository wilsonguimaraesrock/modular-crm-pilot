import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Settings, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

export const WhatsAppIntegration = () => {
  const isMobile = useIsMobile();
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: isMobile ? 10 : 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className={`space-y-${isMobile ? '4' : '6'}`}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Chatwoot Configuration */}
      {!isConfigured && (
        <motion.div variants={item}>
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 border-blue-500/50">
            <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`space-y-${isMobile ? '3' : '4'}`}>
                <div className={`flex ${
                  isMobile ? 'flex-col space-y-2' : 'items-center justify-between'
                }`}>
                  <div className="flex items-center space-x-2">
                    <Settings className="text-blue-400" size={isMobile ? 18 : 20} />
                    <h3 className={`${
                      isMobile ? 'text-base' : 'text-lg'
                    } font-semibold text-white`}>
                      Configurar Chatwoot
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size={isMobile ? "sm" : "sm"}
                    className="text-blue-400 border-blue-400 hover:bg-blue-400/10"
                    onClick={() => window.open('https://chatwoot.com', '_blank')}
                  >
                    <ExternalLink className="mr-2" size={16} />
                    Chatwoot.com
                  </Button>
                </div>
                
                <div className={`grid ${
                  isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'
                }`}>
                  <div className="space-y-2">
                    <Label htmlFor="chatwoot-url" className={`text-slate-300 ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      URL do Chatwoot
                    </Label>
                    <Input
                      id="chatwoot-url"
                      value={chatwootConfig.url}
                      onChange={(e) => setChatwootConfig({...chatwootConfig, url: e.target.value})}
                      placeholder="https://app.chatwoot.com"
                      className={`bg-slate-700/50 border-slate-600 text-white ${
                        isMobile ? 'h-12' : ''
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chatwoot-token" className={`text-slate-300 ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      API Token
                    </Label>
                    <Input
                      id="chatwoot-token"
                      type="password"
                      value={chatwootConfig.token}
                      onChange={(e) => setChatwootConfig({...chatwootConfig, token: e.target.value})}
                      placeholder="seu-api-token"
                      className={`bg-slate-700/50 border-slate-600 text-white ${
                        isMobile ? 'h-12' : ''
                      }`}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="inbox-id" className={`text-slate-300 ${
                      isMobile ? 'text-sm' : ''
                    }`}>
                      Inbox ID
                    </Label>
                    <Input
                      id="inbox-id"
                      value={chatwootConfig.inboxId}
                      onChange={(e) => setChatwootConfig({...chatwootConfig, inboxId: e.target.value})}
                      placeholder="1"
                      className={`bg-slate-700/50 border-slate-600 text-white ${
                        isMobile ? 'h-12' : ''
                      }`}
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleConfigureChatwoot}
                  className={`${
                    isMobile ? 'w-full h-12' : ''
                  } bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800`}
                >
                  Configurar Chatwoot
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Send Message Form */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <h2 className={`${
              isMobile ? 'text-xl' : 'text-2xl'
            } font-semibold text-white mb-6`}>
              Envio para WhatsApp
            </h2>
            
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              <div>
                <Label htmlFor="phone" className={`text-slate-300 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Número do WhatsApp *
                </Label>
                <Input
                  id="phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+55 11 99999-9999"
                  className={`bg-slate-700/50 border-slate-600 text-white ${
                    isMobile ? 'h-12' : ''
                  }`}
                />
              </div>
              
              <div>
                <Label htmlFor="message" className={`text-slate-300 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Mensagem
                </Label>
                <Textarea
                  id="message"
                  value={message || defaultMessage}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={isMobile ? 8 : 12}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Digite sua mensagem personalizada..."
                />
              </div>
              
              <Button
                onClick={handleSendWhatsApp}
                disabled={!phoneNumber.trim() || !isConfigured}
                className={`${
                  isMobile ? 'w-full h-12' : ''
                } bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50`}
              >
                <Send className="mr-2" size={18} />
                Enviar via WhatsApp
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Integration Info */}
      <motion.div variants={item}>
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <MessageSquare className="text-green-400" size={isMobile ? 18 : 20} />
              <h3 className={`${
                isMobile ? 'text-base' : 'text-lg'
              } font-semibold text-white`}>
                Integração WhatsApp
              </h3>
            </div>
            
            <div className={`space-y-${isMobile ? '3' : '4'}`}>
              <div className={`flex ${
                isMobile ? 'flex-col space-y-2' : 'items-center justify-between'
              } p-4 bg-slate-700/30 rounded-lg`}>
                <div>
                  <p className={`text-white font-medium ${
                    isMobile ? 'text-sm' : ''
                  }`}>
                    Status da Integração
                  </p>
                  <p className={`text-slate-400 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {isConfigured ? 'Chatwoot configurado e pronto' : 'Aguardando configuração'}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isConfigured 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {isConfigured ? 'Conectado' : 'Desconectado'}
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <h4 className={`text-white font-medium mb-2 ${
                  isMobile ? 'text-sm' : ''
                }`}>
                  Como funciona:
                </h4>
                <ul className={`text-slate-400 space-y-1 ${
                  isMobile ? 'text-xs' : 'text-sm'
                }`}>
                  <li>• Configure sua conta Chatwoot</li>
                  <li>• Conecte o WhatsApp Business no Chatwoot</li>
                  <li>• Envie leads qualificados automaticamente</li>
                  <li>• Receba respostas no painel do Chatwoot</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};
