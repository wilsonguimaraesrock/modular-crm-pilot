
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export const LeadCapture = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    interest: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Lead capturado:', formData);
    
    toast({
      title: "Lead Capturado com Sucesso!",
      description: "O lead foi adicionado ao sistema e será qualificado pela IA.",
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      interest: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h2 className="text-2xl font-semibold text-white mb-6">Captura de Leads</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="text-slate-300">E-mail *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="email@exemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="phone" className="text-slate-300">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div>
              <Label htmlFor="company" className="text-slate-300">Empresa</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Nome da empresa"
              />
            </div>
            
            <div>
              <Label className="text-slate-300">Origem do Lead</Label>
              <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="referral">Indicação</SelectItem>
                  <SelectItem value="other">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300">Interesse</Label>
              <Select value={formData.interest} onValueChange={(value) => handleInputChange('interest', value)}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Área de interesse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crm">Sistema CRM</SelectItem>
                  <SelectItem value="automation">Automação</SelectItem>
                  <SelectItem value="ai">Inteligência Artificial</SelectItem>
                  <SelectItem value="integration">Integrações</SelectItem>
                  <SelectItem value="consulting">Consultoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Capturar Lead
          </Button>
        </form>
      </Card>

      {/* Webhook Integration Section */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Integrações Disponíveis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Facebook Ads', status: 'Ativo', color: 'bg-green-500' },
            { name: 'RD Station', status: 'Configurar', color: 'bg-yellow-500' },
            { name: 'Google Ads', status: 'Configurar', color: 'bg-yellow-500' },
          ].map((integration, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">{integration.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${integration.color} text-white`}>
                  {integration.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
