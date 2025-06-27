# 📋 CRM Inteligente - Documentação Técnica Completa

## 🏗️ **Visão Geral da Arquitetura**

O **CRM Inteligente** é um sistema modular de gestão de relacionamento com clientes, construído com tecnologias modernas e focado na automação inteligente do processo de vendas.

### **Stack Tecnológica**
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **UI Framework**: shadcn/ui + Tailwind CSS
- **Animações**: Framer Motion
- **Roteamento**: React Router DOM
- **Gerenciamento de Estado**: TanStack Query
- **Formulários**: React Hook Form + Zod
- **Notificações**: Sonner + shadcn Toast

---

## 📁 **Estrutura do Projeto**

```
src/
├── components/
│   ├── crm/                 # Componentes específicos do CRM
│   │   ├── AdminPanel.tsx           # Painel de configurações administrativas
│   │   ├── CalendarScheduling.tsx   # Sistema de agendamento
│   │   ├── DashboardOverview.tsx    # Dashboard principal
│   │   ├── LeadCapture.tsx          # Captura de leads
│   │   ├── LeadQualification.tsx    # Qualificação com IA
│   │   ├── Navigation.tsx           # Navegação lateral
│   │   └── WhatsAppIntegration.tsx  # Integração WhatsApp/Chatwoot
│   └── ui/                  # Componentes de interface reutilizáveis
├── hooks/                   # Custom hooks
├── lib/                     # Utilitários e configurações
├── pages/                   # Páginas da aplicação
├── App.tsx                  # Componente raiz
└── main.tsx                 # Entry point
```

---

## 🧩 **Módulos Principais**

### **1. 📊 Dashboard (DashboardOverview.tsx)**

**Funcionalidade**: Painel principal com métricas e visão geral do pipeline de vendas.

**Componentes Principais**:
- **Cards de Estatísticas**: Exibem métricas em tempo real
- **Pipeline Visual**: Visualização do funil de vendas
- **Animações**: Efeitos visuais com Framer Motion

**Estados Gerenciados**:
```typescript
const [stats, setStats] = useState({
  leadsCapturados: 0,           // Total de leads capturados
  qualificadosIA: 0,            // Leads qualificados pela IA
  reunioesAgendadas: 0,         // Reuniões marcadas
  enviadosWhatsApp: 0           // Mensagens enviadas via WhatsApp
});

const [pipeline, setPipeline] = useState({
  novosLeads: 0,                // Leads novos
  qualificados: 0,              // Leads qualificados
  agendados: 0,                 // Leads com reunião agendada
  fechados: 0                   // Vendas fechadas
});
```

**Funcionalidades**:
- ✅ Exibição de métricas em tempo real
- ✅ Pipeline visual interativo
- ✅ Cards animados com gradientes
- ✅ Responsividade completa
- ✅ Botões de ação rápida

---

### **2. 🎯 Captura de Leads (LeadCapture.tsx)**

**Funcionalidade**: Sistema completo para capturar, organizar e gerenciar leads de múltiplas fontes.

**Componentes Principais**:
- **Formulário de Captura**: Interface para adicionar novos leads
- **Gestão de Fontes**: Controle das origens dos leads
- **Lista de Leads Recentes**: Visualização dos últimos leads capturados

**Estados Gerenciados**:
```typescript
const [formData, setFormData] = useState({
  name: '',                     // Nome do lead
  email: '',                    // E-mail do lead
  phone: '',                   // Telefone do lead
  company: '',                 // Empresa do lead
  position: '',                // Cargo do lead
  interests: '',               // Interesses/observações
  source: 'website'            // Fonte de origem
});

const [autoQualification, setAutoQualification] = useState(true);
const [leads, setLeads] = useState<any[]>([]);
```

**Funcionalidades**:
- ✅ Formulário completo de captura
- ✅ Auto-qualificação opcional
- ✅ Múltiplas fontes de leads
- ✅ Validação de dados
- ✅ Notificações de sucesso/erro
- ✅ Interface em abas (Captura/Fontes/Recentes)

**Fontes de Leads Suportadas**:
- 🌐 Website (formulários)
- 📘 Facebook Ads
- 📷 Instagram
- 💼 LinkedIn

---

### **3. 🤖 Qualificação com IA (LeadQualification.tsx)**

**Funcionalidade**: Sistema de qualificação automática usando ChatGPT para avaliar leads através de conversas estruturadas com distribuição equitativa entre vendedores.

**Componentes Principais**:
- **Configuração de API**: Setup da integração com ChatGPT
- **Interface de Chat**: Conversa em tempo real com a IA
- **Sistema de Pontuação**: Score automático baseado nas respostas
- **Distribuição de Vendedores**: Atribuição automática e equitativa de leads
- **Apresentação Personalizada**: Introdução com nome do vendedor atribuído

**Estados Gerenciados**:
```typescript
const [messages, setMessages] = useState([]);      // Histórico de mensagens
const [currentMessage, setCurrentMessage] = useState(''); // Mensagem atual
const [leadScore, setLeadScore] = useState(0);     // Pontuação do lead (0-100)
const [apiKey, setApiKey] = useState('');          // API Key do ChatGPT
const [isConfigured, setIsConfigured] = useState(false); // Status da configuração
const [assignedSeller, setAssignedSeller] = useState<Seller | null>(null); // Vendedor atribuído
const [currentStage, setCurrentStage] = useState(0); // Estágio atual BANT
const [stageScores, setStageScores] = useState<Record<string, number>>({}); // Pontuações por estágio
```

**Funcionalidades**:
- ✅ Integração completa com ChatGPT
- ✅ Sistema de pontuação inteligente BANT
- ✅ Interface de chat fluida
- ✅ Configuração segura de API
- ✅ Análise automática de respostas
- ✅ SDR Virtual configurável
- ✅ **Distribuição equitativa de leads entre vendedores**
- ✅ **Apresentação personalizada com nome do vendedor**
- ✅ **Rastreamento visual do vendedor atribuído**
- ✅ **Metodologia BANT estruturada (Budget, Authority, Need, Timing)**
- ✅ **Conversação sequencial inteligente**

**Sistema de Distribuição Equitativa**:
```typescript
const getNextAvailableSeller = (schoolId: string): Seller | null => {
  // Buscar vendedores ativos da escola
  const activeSellers = getSellersBySchool(schoolId).filter(seller => seller.active);
  
  if (activeSellers.length === 0) return null;
  if (activeSellers.length === 1) return activeSellers[0];
  
  // Contar leads atribuídos a cada vendedor
  const schoolLeads = getLeadsBySchool(schoolId);
  const sellerLeadCounts = activeSellers.map(seller => ({
    seller,
    leadCount: schoolLeads.filter(lead => lead.assignedTo === seller.id).length
  }));
  
  // Ordenar por menor número de leads e retornar o primeiro
  sellerLeadCounts.sort((a, b) => a.leadCount - b.leadCount);
  return sellerLeadCounts[0].seller;
};
```

**Algoritmo de Pontuação BANT**:
```typescript
const qualificationStages = [
  {
    id: 'interest',
    name: 'Interesse',
    question: 'Vi que você demonstrou interesse em nossos cursos...',
    keywords: ['trabalho', 'carreira', 'viagem', 'estudo'],
    maxScore: 25
  },
  {
    id: 'urgency', 
    name: 'Urgência',
    keywords: ['urgente', 'rápido', 'logo', 'mês'],
    maxScore: 25
  },
  // ... outros estágios
];
```

---

### **4. 📅 Agendamento (CalendarScheduling.tsx)**

**Funcionalidade**: Sistema de agendamento de reuniões com integração potencial ao Google Calendar.

**Componentes Principais**:
- **Seletor de Data**: Interface para escolher datas disponíveis
- **Slots de Horário**: Horários disponíveis para agendamento
- **Lista de Reuniões**: Visualização de reuniões agendadas

**Estados Gerenciados**:
```typescript
const [selectedDate, setSelectedDate] = useState<string>('');
const [selectedTime, setSelectedTime] = useState<string>('');
```

**Funcionalidades**:
- ✅ Seleção de datas futuras
- ✅ Slots de horário predefinidos
- ✅ Lista de reuniões agendadas
- ✅ Status de confirmação
- 🔄 Integração com Google Calendar (em desenvolvimento)

---

### **5. 💬 Integração WhatsApp (WhatsAppIntegration.tsx)**

**Funcionalidade**: Sistema de envio automatizado de mensagens via Chatwoot para WhatsApp Business.

**Componentes Principais**:
- **Configuração Chatwoot**: Setup da integração
- **Interface de Envio**: Formulário para enviar mensagens
- **Templates**: Modelos pré-definidos de mensagens

**Estados Gerenciados**:
```typescript
const [chatwootConfig, setChatwootConfig] = useState({
  url: '',                      // URL da instância Chatwoot
  token: '',                    // Token de API
  inboxId: ''                   // ID da inbox
});
const [isConfigured, setIsConfigured] = useState(false);
```

**Funcionalidades**:
- ✅ Integração completa com Chatwoot
- ✅ Envio automatizado de mensagens
- ✅ Templates personalizáveis
- ✅ Configuração segura de credenciais
- ✅ Suporte a múltiplas inboxes

**Template Padrão de Mensagem**:
```
🎯 *Lead Qualificado - CRM Inteligente*

Olá! Identifiquei um lead com alto potencial de conversão.

📊 *Informações do Lead:*
- Score: [Score]/100
- Nome: [Nome]
- Email: [Email]
- Telefone: [Telefone]

💡 *Próximos Passos:*
1. Contato em até 1 hora
2. Agendar demonstração
3. Enviar proposta

*Enviado automaticamente pelo CRM*
```

---

### **6. ⚙️ Painel Administrativo (AdminPanel.tsx)**

**Funcionalidade**: Centro de controle completo do sistema com 4 módulos principais organizados em abas.

#### **6.1 🎯 Fontes de Leads** (Nova Funcionalidade)

**Objetivo**: Controle total sobre as origens de captura de leads.

**Estados Gerenciados**:
```typescript
const [leadSources, setLeadSources] = useState([
  {
    id: 'website',
    name: 'Website',
    type: 'form',                    // 'form' ou 'integration'
    icon: Globe,
    active: true,                    // Status ativo/inativo
    url: 'https://seusite.com.br/contato',
    description: 'Formulário de contato do website principal',
    fields: ['name', 'email', 'phone', 'message'],
    autoAssign: 'Carlos Silva',      // Responsável automático
    notifications: true,             // Notificações ativas
    webhookUrl: '',                  // URL do webhook
    leadsCount: 125                  // Contador de leads
  }
  // ... outras fontes
]);

const [newSource, setNewSource] = useState({
  name: '',
  type: 'form',
  description: '',
  url: '',
  autoAssign: 'Carlos Silva',
  notifications: true,
  fields: ['name', 'email']
});
```

**Funcionalidades**:
- ✅ **Visualização em Cards**: Cada fonte exibida em card individual
- ✅ **Ativar/Desativar**: Toggle para controlar status das fontes
- ✅ **Contadores**: Número de leads capturados por fonte
- ✅ **Atribuição Automática**: Designar responsável por fonte
- ✅ **Tipos de Fonte**: Formulários ou Integrações
- ✅ **Adicionar Novas Fontes**: Interface para criar fontes personalizadas
- ✅ **Edição de Fontes**: Modificar fontes existentes
- ✅ **Webhooks**: Suporte a integrações via webhook

**Fontes Pré-configuradas**:
1. **Website** (Formulário) - 125 leads
2. **Facebook Ads** (Integração) - 89 leads
3. **Instagram** (Integração) - 0 leads (inativo)
4. **LinkedIn** (Integração) - 45 leads
5. **Landing Page** (Formulário) - 67 leads

#### **6.2 🤖 Configuração da IA**

**Objetivo**: Customizar o comportamento do SDR Virtual.

**Funcionalidades**:
- ✅ Editor de prompt do ChatGPT
- ✅ Configuração de diretrizes de qualificação
- ✅ Critérios de pontuação personalizáveis

#### **6.3 👥 Gestão de Equipe**

**Objetivo**: Gerenciar vendedores e suas atribuições com distribuição automática de leads.

**Estados Gerenciados**:
```typescript
const [salesTeam, setSalesTeam] = useState([
  { 
    name: 'Carlos Silva', 
    phone: '+55 11 99999-9999', 
    role: 'Vendedor Senior', 
    active: true 
  },
  // ... outros membros
]);

// Estatísticas de distribuição
const [distributionStats, setDistributionStats] = useState([
  {
    seller: { name: 'Carlos Silva', role: 'Vendedor Senior' },
    totalLeads: 45,
    todayLeads: 3,
    percentage: 35
  },
  // ... outros vendedores
]);
```

**Funcionalidades**:
- ✅ Lista de vendedores
- ✅ Status ativo/inativo
- ✅ Informações de contato
- ✅ Hierarquia de cargos
- ✅ **Painel de Distribuição Equitativa**
- ✅ **Estatísticas visuais por vendedor**
- ✅ **Contador de leads por vendedor**
- ✅ **Percentual de distribuição**
- ✅ **Leads recebidos hoje**
- ✅ **Barras de progresso visuais**
- ✅ **Indicador do sistema automático**

#### **6.4 🔧 Configurações do Sistema**

**Objetivo**: Configurações globais do CRM.

**Funcionalidades**:
- ✅ Horário de funcionamento
- ✅ Fuso horário
- ✅ Toggles de funcionalidades
- ✅ Configurações de notificação

---

### **7. 🧭 Navegação (Navigation.tsx)**

**Funcionalidade**: Menu lateral principal com navegação entre módulos.

**Módulos Disponíveis**:
```typescript
const modules = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
  { id: 'leads', name: 'Captura de Leads', icon: Users },
  { id: 'qualification', name: 'Qualificação IA', icon: MessageSquare },
  { id: 'calendar', name: 'Agendamento', icon: Calendar },
  { id: 'whatsapp', name: 'WhatsApp', icon: Send },
  { id: 'admin', name: 'Configurações', icon: Settings }
];
```

**Funcionalidades**:
- ✅ Navegação responsiva
- ✅ Indicadores visuais de módulo ativo
- ✅ Badges de notificação
- ✅ Status do sistema
- ✅ Animações suaves

---

## 🎯 **Sistema de Distribuição Equitativa de Leads**

### **Funcionalidade Principal**
O sistema automaticamente distribui novos leads entre os vendedores ativos de forma equilibrada, garantindo que nenhum vendedor fique sobrecarregado e que todos tenham oportunidades iguais.

### **Algoritmo de Distribuição**
```typescript
const getNextAvailableSeller = (schoolId: string): Seller | null => {
  // 1. Buscar vendedores ativos da escola
  const activeSellers = getSellersBySchool(schoolId).filter(seller => seller.active);
  
  // 2. Verificar se há vendedores disponíveis
  if (activeSellers.length === 0) return null;
  if (activeSellers.length === 1) return activeSellers[0];
  
  // 3. Contar leads atribuídos a cada vendedor
  const schoolLeads = getLeadsBySchool(schoolId);
  const sellerLeadCounts = activeSellers.map(seller => ({
    seller,
    leadCount: schoolLeads.filter(lead => lead.assignedTo === seller.id).length
  }));
  
  // 4. Ordenar por menor número de leads atribuídos
  sellerLeadCounts.sort((a, b) => a.leadCount - b.leadCount);
  
  // 5. Retornar o vendedor com menos leads
  return sellerLeadCounts[0].seller;
};
```

### **Características do Sistema**
- **Automático**: Não requer intervenção manual
- **Equitativo**: Distribui baseado na carga atual de cada vendedor
- **Isolado por Escola**: Cada escola tem sua distribuição independente
- **Transparente**: Interface visual mostra a distribuição em tempo real
- **Flexível**: Considera apenas vendedores ativos

### **Interface Visual**
O painel administrativo exibe:
- **Cards por Vendedor**: Mostrando estatísticas individuais
- **Barras de Progresso**: Indicando percentual de leads atribuídos
- **Contadores**: Total de leads e leads recebidos hoje
- **Status Visual**: Badges indicando performance
- **Indicador Automático**: Confirmação de que o sistema está funcionando

### **Integração com Qualificação IA**
- Ao iniciar uma conversa, o sistema automaticamente seleciona o próximo vendedor
- O lead é apresentado com o nome do vendedor atribuído
- A conversa é personalizada com informações do vendedor
- Quando o lead for convertido, já estará atribuído ao vendedor correto

---

## 🔄 **Fluxo de Dados**

### **Pipeline Completo de Leads**:

1. **Captura** (LeadCapture) 
   → 2. **Qualificação** (LeadQualification)
   → 3. **Agendamento** (CalendarScheduling)
   → 4. **WhatsApp** (WhatsAppIntegration)

### **Estados Compartilhados**:
- Leads são criados no módulo de Captura
- Pontuação é atribuída no módulo de Qualificação
- Reuniões são agendadas no módulo de Agendamento
- Notificações são enviadas via WhatsApp

---

## 🎨 **Design System**

### **Paleta de Cores**:
- **Primária**: Gradientes azuis (`from-blue-600 to-blue-700`)
- **Background**: Slate escuro (`bg-slate-900`, `bg-slate-800/50`)
- **Texto**: Branco e tons de slate (`text-white`, `text-slate-300`)
- **Bordas**: Slate médio (`border-slate-700`)

### **Componentes de UI**:
- **Cards**: Fundo translúcido com backdrop-blur
- **Botões**: Gradientes com hover effects
- **Inputs**: Background escuro com bordas destacadas
- **Badges**: Variações coloridas por contexto

### **Animações**:
- **Entrada**: Stagger children com Framer Motion
- **Hover**: Scale e shadow effects
- **Transições**: Smooth com duration personalizada

---

## 🔧 **Configurações Técnicas**

### **Dependências Principais**:
```json
{
  "@tanstack/react-query": "^5.56.2",    // Gerenciamento de estado
  "react-hook-form": "^7.53.0",          // Formulários
  "zod": "^3.23.8",                       // Validação
  "framer-motion": "^12.19.1",           // Animações
  "react-router-dom": "^6.26.2",         // Roteamento
  "lucide-react": "^0.462.0",            // Ícones
  "tailwindcss": "^3.4.11",              // CSS
  "recharts": "^2.12.7"                  // Gráficos
}
```

### **Scripts Disponíveis**:
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento
npm run lint         # Linting
npm run preview      # Preview da build
```

---

## 🚀 **Funcionalidades Implementadas**

### ✅ **Concluídas**:
- [x] Dashboard com métricas
- [x] Captura de leads multi-fonte
- [x] Qualificação com ChatGPT + Metodologia BANT
- [x] **🎯 Sistema de distribuição equitativa de leads**
- [x] **👤 Apresentação personalizada com nome do vendedor**
- [x] **📊 Estatísticas visuais de distribuição no AdminPanel**
- [x] **🤖 Conversação sequencial inteligente com IA**
- [x] **🎨 Interface visual do vendedor atribuído**
- [x] Sistema de agendamento
- [x] Integração WhatsApp/WAHA
- [x] Painel administrativo completo
- [x] **Gestão inteligente de equipe de vendas**
- [x] Configuração de fontes de leads
- [x] Navegação modular
- [x] Design responsivo
- [x] Animações fluidas

### 🔄 **Em Desenvolvimento**:
- [ ] Integração Google Calendar
- [ ] Relatórios avançados
- [ ] API REST completa
- [ ] Sistema de webhooks
- [ ] Autenticação de usuários

### 🎯 **Próximas Funcionalidades**:
- [ ] Dashboard de analytics
- [ ] CRM pipeline visual
- [ ] Automações por triggers
- [ ] Integrações com mais plataformas
- [ ] Sistema de notificações push

---

## 📱 **Responsividade**

O sistema é completamente responsivo com breakpoints:
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

Todos os componentes se adaptam automaticamente usando classes Tailwind CSS responsivas.

---

## 🔐 **Segurança**

### **Dados Sensíveis**:
- API Keys são armazenadas em estado local (para desenvolvimento)
- Tokens são mascarados nos inputs
- Configuração de acesso restrito ao painel admin

### **Recomendações para Produção**:
- Implementar autenticação JWT
- Armazenar credenciais em variáveis de ambiente
- Adicionar rate limiting nas APIs
- Implementar logs de auditoria

---

## 🧪 **Como Testar**

### **1. Executar o Projeto**:
```bash
npm install
npm run dev
```

### **2. Navegar pelos Módulos**:
1. **Dashboard**: Visualizar métricas gerais
2. **Captura**: Adicionar novos leads
3. **Qualificação**: Configurar ChatGPT e testar IA
4. **Agendamento**: Marcar reuniões
5. **WhatsApp**: Configurar Chatwoot e enviar mensagens
6. **Configurações**: Gerenciar fontes de leads e sistema

### **3. Testar Integrações**:
- **ChatGPT**: Inserir API key válida
- **Chatwoot**: Configurar URL, token e inbox ID
- **Formulários**: Testar validações e submissões

---

## 📈 **Métricas e Analytics**

O sistema coleta automaticamente:
- Número de leads por fonte
- Taxa de qualificação da IA
- Reuniões agendadas vs realizadas
- Mensagens enviadas via WhatsApp
- Performance do pipeline de vendas

---

## 🔧 **Manutenção e Escalabilidade**

### **Arquitetura Modular**:
- Cada módulo é independente
- Estados isolados por componente
- Fácil adição de novos módulos
- Componentes reutilizáveis

### **Performance**:
- Lazy loading de componentes
- Otimização de re-renders
- Animações performáticas
- Bundle splitting automático

---

## 👨‍💻 **Para Desenvolvedores**

### **Padrões de Código**:
- TypeScript rigoroso
- Componentes funcionais com hooks
- Custom hooks para lógica reutilizável
- Padronização de nomes e estruturas

### **Estrutura de Componente Padrão**:
```typescript
export const ComponentName = () => {
  // 1. Estados
  const [state, setState] = useState();
  
  // 2. Hooks personalizados
  const { toast } = useToast();
  
  // 3. Funções auxiliares
  const handleAction = () => {};
  
  // 4. Efeitos
  useEffect(() => {}, []);
  
  // 5. Render
  return (
    <motion.div>
      {/* JSX */}
    </motion.div>
  );
};
```

---

Este CRM Inteligente representa uma solução completa e moderna para gestão de leads, com foco na automação inteligente e experiência do usuário de alta qualidade. O sistema está preparado para crescer e se adaptar às necessidades específicas de cada negócio. 