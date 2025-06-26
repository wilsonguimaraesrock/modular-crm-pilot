
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const LeadQualification = () => {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: 'Sistema de qualificação IA pronto. Configure sua API key do ChatGPT para começar.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadScore, setLeadScore] = useState(0);
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    if (!isConfigured) {
      toast({
        title: "Configuração necessária",
        description: "Configure sua API key do ChatGPT primeiro",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Call ChatGPT API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Você é um SDR Virtual da Rockfeller. Sua função é qualificar leads através de perguntas estratégicas. Seja conversacional, profissional e focado em identificar: interesse, urgência, orçamento e autoridade de decisão.'
            },
            {
              role: 'user',
              content: currentMessage
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = {
          type: 'ai',
          content: data.choices[0].message.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
        
        // Update lead score based on response analysis
        const scoreIncrease = analyzeResponse(currentMessage);
        setLeadScore(prev => Math.min(100, prev + scoreIncrease));
      } else {
        throw new Error('Erro na API do ChatGPT');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com o ChatGPT. Verifique sua API key.",
        variant: "destructive",
      });
    }

    setCurrentMessage('');
  };

  const analyzeResponse = (message: string) => {
    const qualifyingKeywords = ['interessado', 'preciso', 'urgente', 'orçamento', 'comprar', 'investir'];
    const hasKeyword = qualifyingKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
    return hasKeyword ? 15 : 5;
  };

  const handleConfigureAPI = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Insira sua API key do ChatGPT",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfigured(true);
    toast({
      title: "Configurado!",
      description: "ChatGPT configurado com sucesso",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      {!isConfigured && (
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 border-blue-500/50">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Settings className="text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Configurar ChatGPT</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="apikey" className="text-slate-300">API Key do ChatGPT</Label>
              <Input
                id="apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <Button
              onClick={handleConfigureAPI}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              Configurar API
            </Button>
          </div>
        </Card>
      )}

      {/* Lead Score */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Qualificação com IA</h2>
          </div>
          <div className="text-center">
            <p className="text-slate-300 text-sm">Score do Lead</p>
            <p className={`text-3xl font-bold ${getScoreColor(leadScore)}`}>{leadScore}/100</p>
          </div>
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="h-96 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                    : message.type === 'ai'
                    ? 'bg-slate-700 text-slate-100'
                    : 'bg-yellow-600/20 text-yellow-200 border border-yellow-600/50'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="bg-slate-700/50 border-slate-600 text-white"
            disabled={!isConfigured}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!isConfigured}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Send size={18} />
          </Button>
        </div>
      </Card>

      {/* Qualification Results */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Critérios de Qualificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { criteria: 'Interesse', score: Math.min(leadScore, 25), max: 25 },
            { criteria: 'Urgência', score: Math.min(Math.max(0, leadScore - 25), 25), max: 25 },
            { criteria: 'Orçamento', score: Math.min(Math.max(0, leadScore - 50), 25), max: 25 },
            { criteria: 'Autoridade', score: Math.min(Math.max(0, leadScore - 75), 25), max: 25 },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-slate-300 font-medium mb-2">{item.criteria}</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(Math.max(0, item.score) / item.max) * 100}%` }}
                />
              </div>
              <p className="text-white font-semibold">{Math.max(0, item.score)}/{item.max}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
