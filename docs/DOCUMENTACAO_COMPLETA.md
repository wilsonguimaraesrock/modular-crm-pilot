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

**Funcionalidade**: Sistema de qualificação automática usando ChatGPT para avaliar leads através de conversas estruturadas.

**Componentes Principais**:
- **Configuração de API**: Setup da integração com ChatGPT
- **Interface de Chat**: Conversa em tempo real com a IA
- **Sistema de Pontuação**: Score automático baseado nas respostas

**Estados Gerenciados**:
```typescript
const [messages, setMessages] = useState([]);      // Histórico de mensagens
const [currentMessage, setCurrentMessage] = useState(''); // Mensagem atual
const [leadScore, setLeadScore] = useState(0);     // Pontuação do lead (0-100)
const [apiKey, setApiKey] = useState('');          // API Key do ChatGPT
const [isConfigured, setIsConfigured] = useState(false); // Status da configuração
```

**Funcionalidades**:
- ✅ Integração completa com ChatGPT
- ✅ Sistema de pontuação inteligente
- ✅ Interface de chat fluida
- ✅ Configuração segura de API
- ✅ Análise automática de respostas
- ✅ SDR Virtual configurável

**Algoritmo de Pontuação**:
```typescript
const analyzeResponse = (message: string) => {
  const qualifyingKeywords = [
    'interessado', 'preciso', 'urgente', 
    'orçamento', 'comprar', 'investir'
  ];
  const hasKeyword = qualifyingKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
  return hasKeyword ? 15 : 5; // Incremento baseado em palavras-chave
};
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

**Funcionalidade**: Sistema completo de integração WhatsApp via WAHA (WhatsApp HTTP API) com interface de conversas em tempo real, fotos de perfil e suporte completo a mídias.

**Componentes Principais**:
- **Configuração WAHA**: Setup da integração com WAHA API
- **Gestão de Conversas**: Interface para visualizar e gerenciar conversas
- **Sistema de Mensagens**: Envio e recebimento de mensagens em tempo real
- **Avatares com Fotos**: Exibição de fotos reais dos contatos nos avatares
- **Player de Mídia**: Suporte completo para áudio, imagem, vídeo e documentos
- **IA Automática**: Automação inteligente de conversas

**Estados Gerenciados**:
```typescript
const [wahaConfig, setWahaConfig] = useState({
  url: 'http://localhost:3000',    // URL da instância WAHA
  apiKey: '',                      // API Key (opcional)
  session: 'default',              // Nome da sessão
  chatgptKey: ''                   // Chave OpenAI para IA
});

const [sessionStatus, setSessionStatus] = useState<WAHASession | null>(null);
const [chats, setChats] = useState<any[]>([]);
const [selectedChat, setSelectedChat] = useState<string | null>(null);
const [chatMessages, setChatMessages] = useState<any[]>([]);
const [profilePictures, setProfilePictures] = useState<{[key: string]: string}>({});
```

**Funcionalidades de Conexão**:
- ✅ **Status em Tempo Real**: Monitor de conexão WhatsApp (WORKING/SCAN_QR_CODE/STARTING/STOPPED)
- ✅ **QR Code Automático**: Geração e exibição de QR Code para conexão
- ✅ **Reconexão Automática**: Sistema de reconexão quando necessário
- ✅ **Monitoramento Contínuo**: Verificação de status a cada 10 segundos

**Funcionalidades de Conversas**:
- ✅ **Lista de Conversas**: Visualização de todas as conversas ativas
- ✅ **Fotos de Perfil**: Exibição das fotos reais dos contatos nos avatares
- ✅ **Badges de Mensagens**: Contador de mensagens não lidas
- ✅ **Filtros Inteligentes**: Filtrar por contatos individuais ou incluir grupos
- ✅ **Busca Avançada**: Buscar conversas por nome, ID ou número
- ✅ **Auto-refresh**: Atualização automática a cada 5 segundos

**Sistema de Avatares com Fotos**:
```typescript
const ChatAvatar = ({ chat, size = 40, className = "" }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  
  // Busca automática da foto de perfil via API WAHA
  useEffect(() => {
    if (!chat.isGroup && sessionStatus?.status === 'WORKING') {
      getContactProfilePicture(chat.id._serialized)
        .then(url => setProfilePicUrl(url))
        .catch(() => setProfilePicUrl(null));
    }
  }, [chat.id._serialized]);

  // Renderização com foto real ou fallback para ícones
  return profilePicUrl ? (
    <img src={profilePicUrl} className="rounded-full" />
  ) : (
    <div className="rounded-full bg-blue-500">
      {chat.isGroup ? <Users /> : <User />}
    </div>
  );
};
```

**Funcionalidades de Mídia**:
- ✅ **Player de Áudio**: Reprodução nativa de mensagens de voz
- ✅ **Visualizador de Imagens**: Exibição e download de imagens
- ✅ **Player de Vídeo**: Reprodução de vídeos compartilhados
- ✅ **Documentos**: Visualização e download de arquivos
- ✅ **URLs de Mídia**: Obtenção automática de URLs via `downloadMedia=true`

**Funcionalidades de Mensagens**:
- ✅ **Histórico Completo**: Carregamento das últimas 24 horas ou 50 mensagens
- ✅ **Scroll Automático**: Auto-scroll para mensagens mais recentes
- ✅ **Status de Leitura**: Marcação automática de mensagens como lidas
- ✅ **Timestamps**: Horário de envio/recebimento
- ✅ **Indicadores de Entrega**: Status de entrega das mensagens (✓, ✓✓, ✓✓ azul)

**IA Automática**:
- ✅ **Resposta Automática**: Sistema de IA para responder automaticamente
- ✅ **Horário de Funcionamento**: Configuração de horários de trabalho
- ✅ **Gatilhos de Transferência**: Palavras-chave para transferir para humano
- ✅ **Base de Conhecimento**: Integração com dados da Rockfeller Brasil

**Funções da API WAHA**:
```typescript
// Buscar foto de perfil de um contato
const getContactProfilePicture = async (contactId: string) => {
  const response = await makeWAHARequest(
    `/api/contacts/profile-picture?session=${session}&contactId=${contactId}`
  );
  return response?.profilePictureURL || null;
};

// Carregar mensagens com mídia
const loadChatMessages = async (chatId: string) => {
  const url = `/api/${session}/chats/${chatId}/messages?limit=100&downloadMedia=true`;
  const messages = await makeWAHARequest(url);
  return messages.sort((a, b) => a.timestamp - b.timestamp);
};

// Marcar conversa como lida
const markChatAsRead = async (chatId: string) => {
  await makeWAHARequest(`/api/${session}/chats/${chatId}/messages/read`, {
    method: 'POST'
  });
};
```

**Interface Moderna**:
- ✅ **Design Responsivo**: Adaptável a diferentes tamanhos de tela
- ✅ **Tema Escuro**: Interface elegante com gradientes
- ✅ **Animações Suaves**: Transições com Framer Motion
- ✅ **Notificações Toast**: Feedback visual para ações
- ✅ **Status Dinâmico**: Indicadores visuais de conexão em tempo real

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

**Objetivo**: Gerenciar vendedores e suas atribuições.

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
```

**Funcionalidades**:
- ✅ Lista de vendedores
- ✅ Status ativo/inativo
- ✅ Informações de contato
- ✅ Hierarquia de cargos

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
- [x] Qualificação com ChatGPT
- [x] Sistema de agendamento
- [x] Integração WhatsApp/Chatwoot
- [x] Painel administrativo completo
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