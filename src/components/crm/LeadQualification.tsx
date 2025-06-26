
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

export const LeadQualification = () => {
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Olá! Sou o SDR Virtual da Rockfeller. Vou te ajudar a entender melhor suas necessidades. Qual é o principal desafio da sua empresa hoje?',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadScore, setLeadScore] = useState(0);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(currentMessage);
      setMessages(prev => [...prev, aiResponse]);
      
      // Update lead score based on response
      const scoreIncrease = calculateScoreIncrease(currentMessage);
      setLeadScore(prev => Math.min(100, prev + scoreIncrease));
    }, 1000);

    setCurrentMessage('');
  };

  const generateAIResponse = (userMessage: string) => {
    const responses = [
      "Entendi. Isso é realmente um desafio comum. Quantos funcionários trabalham na sua empresa?",
      "Interessante! E qual é o seu orçamento aproximado para uma solução como esta?",
      "Perfeito! Com base no que você me contou, acredito que nossa solução pode te ajudar muito. Gostaria de agendar uma demonstração?",
      "Excelente! Vou te conectar com um de nossos especialistas. Qual seria o melhor horário para você?"
    ];
    
    return {
      type: 'ai',
      content: responses[Math.floor(Math.random() * responses.length)],
      timestamp: new Date()
    };
  };

  const calculateScoreIncrease = (message: string) => {
    const keywords = ['orçamento', 'comprar', 'interessado', 'urgente', 'preciso'];
    const hasKeyword = keywords.some(keyword => message.toLowerCase().includes(keyword));
    return hasKeyword ? 15 : 5;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Lead Score */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Qualificação com IA</h2>
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
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-slate-700 text-slate-100'
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
          />
          <Button
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send size={18} />
          </Button>
        </div>
      </Card>

      {/* Qualification Results */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Critérios de Qualificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { criteria: 'Interesse', score: Math.min(leadScore, 35), max: 35 },
            { criteria: 'Urgência', score: Math.min(leadScore - 35, 35), max: 35 },
            { criteria: 'Orçamento', score: Math.min(leadScore - 70, 30), max: 30 },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-slate-300 font-medium mb-2">{item.criteria}</p>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
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
