import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

export const EmbedChatQualificacao = ({ schoolId }: { schoolId: string }) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'system',
      content: 'Chat de qualificação carregado! Clique em "Iniciar Conversa" para começar.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [leadScore, setLeadScore] = useState(0);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (conversationStarted && messages.length > 1) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, conversationStarted]);

  const startConversation = () => {
    setConversationStarted(true);

    const welcomeMessage = `Olá! 😊

Sou a assistente virtual da Rockfeller Brasil! 

Vou te fazer algumas perguntinhas rápidas para entender melhor como posso te ajudar com o inglês.

Como você gostaria que eu te chamasse?`;

    const initialMessage: Message = {
      type: 'ai',
      content: welcomeMessage,
      timestamp: new Date()
    };

    setMessages([initialMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    setIsTyping(true);
    
    setTimeout(() => {
      const responses = [
        "Muito prazer! Qual é o seu principal objetivo com o inglês?",
        "Entendi! Quando você gostaria de começar?",
        "Perfeito! Nossa equipe entrará em contato em breve. Obrigada!"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        type: 'ai',
        content: randomResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setLeadScore(prev => Math.min(100, prev + 25));
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-blue-400';
    return 'text-red-400';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="text-blue-400" size={20} />
            <h1 className="text-lg font-semibold text-white">
              Qualificação Rockfeller
            </h1>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400">Score</p>
            <p className={`text-lg font-bold ${getScoreColor(leadScore)}`}>
              {leadScore}/100
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4">
        <Card className="flex-1 flex flex-col bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex-1 overflow-y-auto space-y-3 p-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : msg.type === 'ai'
                      ? 'bg-slate-700 text-slate-100'
                      : 'bg-slate-600 text-slate-300 text-center'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-slate-700 p-4">
            {!conversationStarted ? (
              <Button
                onClick={startConversation}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                <MessageCircle className="mr-2" size={18} />
                Iniciar Conversa
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Input
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send size={18} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
