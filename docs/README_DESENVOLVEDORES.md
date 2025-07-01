# 🚀 CRM Inteligente - Guia para Desenvolvedores

## ⚡ Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Executar em desenvolvimento
npm run dev

# 3. Acessar o sistema
http://localhost:8081
```

## 📋 **Checklist de Funcionalidades**

### ✅ **Implementado e Funcional**
- [x] **Dashboard**: Métricas em tempo real, pipeline visual
- [x] **Captura de Leads**: Formulário multi-fonte, validação
- [x] **Qualificação IA**: Integração ChatGPT, conversa conversacional com foco em agendamento
- [x] **🎯 Sistema de Distribuição Equitativa**: Atribuição automática de leads
- [x] **👤 Apresentação Personalizada**: Nome do vendedor na conversa
- [x] **📊 Painel de Estatísticas**: Distribuição visual por vendedor
- [x] **Agendamento**: Seleção de datas, slots de horário
- [x] **WhatsApp**: Sistema completo com WAHA, fotos de perfil e mídia
- [x] **Admin Panel**: 4 abas organizadas + estatísticas de distribuição
- [x] **Fontes de Leads**: Gestão completa
- [x] **Navegação**: Menu lateral responsivo
- [x] **Design System**: Tema dark, animações

### 🔄 **Próximas Implementações**
- [ ] Autenticação JWT
- [ ] API REST completa
- [ ] Google Calendar
- [ ] Webhooks reais
- [ ] Relatórios avançados

## 🗂️ **Estrutura de Arquivos**

```
src/
├── components/crm/          # 🎯 Módulos principais
│   ├── AdminPanel.tsx              # ⚙️ Configurações (4 abas)
│   ├── DashboardOverview.tsx       # 📊 Dashboard + métricas
│   ├── LeadCapture.tsx             # 🎯 Captura multi-fonte
│   ├── LeadQualification.tsx       # 🤖 IA + ChatGPT
│   ├── CalendarScheduling.tsx      # 📅 Agendamento
│   ├── WhatsAppIntegration.tsx     # 💬 WhatsApp/WAHA + Chat
│   └── Navigation.tsx              # 🧭 Menu lateral
├── components/ui/           # 🎨 Componentes reutilizáveis
├── hooks/                   # 🔧 Custom hooks
├── lib/                     # 🛠️ Utilitários
└── pages/                   # 📄 Páginas
```

## 🔧 **Padrões de Código**

### **1. Estrutura de Componente**
```typescript
export const ComponentName = () => {
  // 1. Estados locais
  const [state, setState] = useState();
  
  // 2. Hooks personalizados  
  const { toast } = useToast();
  
  // 3. Funções auxiliares
  const handleAction = () => {};
  
  // 4. Efeitos
  useEffect(() => {}, []);
  
  // 5. Animações (Framer Motion)
  const variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };
  
  // 6. Render
  return (
    <motion.div variants={variants}>
      {/* JSX */}
    </motion.div>
  );
};
```

### **2. Comentários Obrigatórios**
```typescript
/**
 * FUNÇÃO: Descrição clara da função
 * 
 * Detalhes do que faz, como funciona, side effects.
 * 
 * @param param - Descrição do parâmetro
 * @returns Descrição do retorno
 */
const handleFunction = (param: string) => {
  // Código comentado linha por linha se necessário
};

/**
 * ESTADO: Descrição do estado
 * 
 * Estrutura dos dados, quando é usado, como é modificado.
 */
const [state, setState] = useState({});
```

## 🎨 **Design System**

### **Cores Principais**
```css
/* Gradientes primários */
from-blue-600 to-blue-700     /* Botões principais */
from-blue-600 to-purple-600   /* Botões especiais */

/* Backgrounds */
bg-slate-900                  /* Background principal */
bg-slate-800/50              /* Cards com transparência */
bg-slate-700/30              /* Elementos internos */

/* Textos */
text-white                   /* Títulos principais */
text-slate-300              /* Textos secundários */
text-slate-400              /* Textos menos importantes */

/* Bordas */
border-slate-700            /* Bordas padrão */
border-slate-600            /* Bordas de inputs */
```

### **Componentes Padrão**
```typescript
// Card com backdrop blur
<Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">

// Botão gradiente principal  
<Button className="bg-gradient-to-r from-blue-600 to-blue-700">

// Input escuro
<Input className="bg-slate-700/50 border-slate-600 text-white">

// Badge colorido
<Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
```

## 🎯 **Sistema de Distribuição Equitativa**

### **Algoritmo Principal**
```typescript
// AuthContext.tsx
const getNextAvailableSeller = (schoolId: string): Seller | null => {
  // 1. Buscar vendedores ativos da escola
  const activeSellers = getSellersBySchool(schoolId).filter(seller => seller.active);
  
  // 2. Verificações básicas
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

### **Integração com Qualificação**
```typescript
// LeadQualification.tsx
const startConversation = async () => {
  // 1. Buscar próximo vendedor disponível
  const currentSeller = user ? getNextAvailableSeller(user.schoolId) : null;
  
  // 2. Armazenar vendedor atribuído
  setAssignedSeller(currentSeller);
  
  // 3. Personalizar apresentação
  const sellerFirstName = getFirstName(sellerToUse.name);
  const introMessage = `Olá, tudo bem? 😊\n\nEu sou ${sellerFirstName} da ${schoolName}!\n\nComo posso te ajudar hoje?`;
  
  // 4. Iniciar conversa personalizada
  setMessages(prev => [...prev.slice(1), { type: 'ai', content: introMessage, timestamp: new Date() }]);
};
```

### **Estatísticas Visuais**
```typescript
// AdminPanel.tsx
const getLeadDistributionStats = () => {
  const schoolLeads = getLeadsBySchool(user.schoolId);
  const activeSellers = salesTeam.filter(seller => seller.active);
  
  return activeSellers.map(seller => {
    const sellerLeads = schoolLeads.filter(lead => lead.assignedTo === seller.id);
    return {
      seller,
      totalLeads: sellerLeads.length,
      todayLeads: sellerLeads.filter(lead => isToday(lead.createdAt)).length,
      percentage: Math.round((sellerLeads.length / schoolLeads.length) * 100)
    };
  }).sort((a, b) => b.totalLeads - a.totalLeads);
};
```

## 🖼️ **Sistema de Fotos de Perfil WhatsApp**

### **Arquitetura WAHA + Cache**
```typescript
// WhatsAppIntegration.tsx

// 1. Cache em memória para performance
const [profilePictures, setProfilePictures] = useState<{[key: string]: string}>({});

// 2. Função para buscar foto de perfil
const getContactProfilePicture = async (contactId: string): Promise<string | null> => {
  try {
    // Verificar cache primeiro
    if (profilePictures[contactId]) {
      return profilePictures[contactId];
    }

    // Buscar via API WAHA
    const response = await makeWAHARequest(
      `/api/contacts/profile-picture?session=${wahaConfig.session}&contactId=${contactId}`
    );
    
    if (response?.profilePictureURL) {
      // Armazenar no cache
      setProfilePictures(prev => ({
        ...prev,
        [contactId]: response.profilePictureURL
      }));
      return response.profilePictureURL;
    }
    
    return null;
  } catch (error) {
    console.error(`Erro ao obter foto de perfil para ${contactId}:`, error);
    return null;
  }
};
```

### **Componente ChatAvatar Inteligente**
```typescript
const ChatAvatar = ({ chat, size = 40, className = "" }) => {
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Auto-busca da foto para contatos individuais
  useEffect(() => {
    if (!chat.isGroup && sessionStatus?.status === 'WORKING') {
      getContactProfilePicture(chat.id._serialized)
        .then(url => setProfilePicUrl(url))
        .catch(() => setProfilePicUrl(null));
    }
  }, [chat.id._serialized, chat.isGroup, sessionStatus?.status]);

  // Renderização condicional: Foto real > Ícone padrão
  if (!imageError && profilePicUrl && !chat.isGroup) {
    return (
      <div className={`relative ${className}`}>
        <img
          src={profilePicUrl}
          alt={chat.name}
          className="rounded-full object-cover"
          style={{ width: size, height: size }}
          onError={() => setImageError(true)}
        />
        {/* Badge de mensagens não lidas */}
        {chat.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full">
            <span className="text-white text-xs font-bold">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Fallback para ícones (grupos ou sem foto)
  return (
    <div className={`relative ${className}`}>
      {chat.isGroup ? (
        <div className="bg-green-500 rounded-full flex items-center justify-center">
          <Users className="text-white" />
        </div>
      ) : (
        <div className="bg-blue-500 rounded-full flex items-center justify-center">
          <User className="text-white" />
        </div>
      )}
    </div>
  );
};
```

### **Integração com API WAHA**
```typescript
// Endpoints principais
const wahaEndpoints = {
  status: `/api/${session}/auth/me`,
  chats: `/api/${session}/chats`,
  messages: `/api/${session}/chats/${chatId}/messages?downloadMedia=true`,
  profilePicture: `/api/contacts/profile-picture?session=${session}&contactId=${contactId}`,
  sendMessage: `/api/sendText`,
  markAsRead: `/api/${session}/chats/${chatId}/messages/read`
};

// Configuração padrão
const wahaConfig = {
  url: 'http://localhost:3000',    // URL da instância WAHA
  session: 'default',              // Nome da sessão WhatsApp
  apiKey: '',                      // API Key (opcional)
  chatgptKey: ''                   // Para IA automática
};
```

### **Player de Mídia Completo**
```typescript
const renderMediaContent = (media: any) => {
  const mimeType = media.mimetype || '';
  
  if (mimeType.startsWith('audio/')) {
    return (
      <div className="bg-slate-600 rounded p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Volume2 className="text-blue-400" size={16} />
          <span className="text-sm text-slate-300">Mensagem de áudio</span>
        </div>
        <audio controls className="w-full max-w-xs">
          <source src={media.url} type={mimeType} />
        </audio>
      </div>
    );
  }
  
  if (mimeType.startsWith('image/')) {
    return (
      <img 
        src={media.url} 
        alt="Imagem compartilhada"
        className="max-w-xs rounded-lg cursor-pointer hover:opacity-80"
        onClick={() => window.open(media.url, '_blank')}
      />
    );
  }
  
  // Vídeo, documentos, etc...
};
```

## 🔄 **Fluxo de Estados**

### **Pipeline de Leads (Atualizado)**
```
1. LeadCapture → Cria lead
2. LeadQualification → Atribui vendedor + Conversa conversacional focada em agendamento
3. CalendarScheduling → Agenda reunião  
4. WhatsAppIntegration → Envia notificação com nome do vendedor
```

### **Estados Globais**
```typescript
// Dashboard - Métricas gerais
stats: { leadsCapturados, qualificadosIA, reunioesAgendadas, enviadosWhatsApp }
pipeline: { novosLeads, qualificados, agendados, fechados }

// AdminPanel - Configurações
leadSources: Array<SourceConfig>    // Fontes de leads
salesTeam: Array<TeamMember>        // Equipe de vendas
distributionStats: Array<{          // NOVO: Estatísticas de distribuição
  seller: Seller,
  totalLeads: number,
  todayLeads: number,
  percentage: number
}>
aiPrompt: string                    // Prompt da IA
systemSettings: SystemConfig        // Configurações globais

// LeadQualification - Estados específicos
assignedSeller: Seller | null       // NOVO: Vendedor atribuído
currentStage: number                // NOVO: Estágio conversacional atual (3 estágios)
stageScores: Record<string, number> // NOVO: Pontuações por estágio
```

## 🚨 **Debug e Troubleshooting**

### **Problemas Comuns**

**1. Componente não renderiza**
```bash
# Verificar imports
# Verificar se está no roteamento
# Verificar console para erros
```

**2. Estado não atualiza**
```typescript
// ❌ Mutação direta
state.push(item);

// ✅ Imutabilidade  
setState(prev => [...prev, item]);
```

**3. Animações não funcionam**
```typescript
// Verificar se motion.div está importado
import { motion } from 'framer-motion';

// Verificar se variants estão definidos
const variants = { hidden: {}, show: {} };
```

### **Logs Úteis**
```typescript
// Estado atual
console.log('Estado atual:', state);

// Props recebidas
console.log('Props:', props);

// Eventos
console.log('Evento disparado:', eventData);
```

## 🔌 **Integrações**

### **ChatGPT (Qualificação)**
```typescript
const apiCall = {
  url: 'https://api.openai.com/v1/chat/completions',
  headers: { 'Authorization': `Bearer ${apiKey}` },
  body: { model: 'gpt-4', messages: [...] }
};
```

### **Chatwoot (WhatsApp)**
```typescript
const chatwootAPI = {
  url: `${chatwootUrl}/api/v1/accounts/1/messages`,
  headers: { 'api_access_token': token },
  body: { content, phone_number, inbox_id }
};
```

## 📱 **Responsividade**

### **Breakpoints**
```css
/* Mobile First */
.class                    /* < 768px */
.md:class                /* 768px+ */  
.lg:class                /* 1024px+ */
.xl:class                /* 1280px+ */
```

### **Grid Responsivo**
```typescript
// Auto-adaptável
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Flexbox responsivo
<div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
```

## 🧪 **Testes**

### **Checklist Manual**
- [ ] Todos os módulos carregam
- [ ] Formulários validam corretamente
- [ ] Notificações aparecem
- [ ] Animações são fluidas
- [ ] Responsivo em mobile
- [ ] Estados persistem entre navegação

### **Dados de Teste**
```typescript
// Lead de teste
const testLead = {
  name: "João Silva",
  email: "joao@teste.com", 
  phone: "+55 11 99999-9999",
  company: "Empresa Teste",
  source: "website"
};

// ChatGPT API Key de teste
const testApiKey = "sk-test-key-here";

// Chatwoot config de teste  
const testChatwoot = {
  url: "https://app.chatwoot.com",
  token: "test-token",
  inboxId: "1"
};
```

## 🚀 **Deploy**

### **Build**
```bash
# Build de produção
npm run build

# Preview da build
npm run preview

# Build de desenvolvimento  
npm run build:dev
```

### **Verificações**
- [ ] Sem erros de lint: `npm run lint`
- [ ] Build sem erros: `npm run build`
- [ ] Preview funcional: `npm run preview`
- [ ] Assets otimizados
- [ ] Variáveis de ambiente configuradas

---

## 🎯 **Meta: Sistema Production-Ready**

Este CRM está sendo construído com foco na **escalabilidade** e **manutenibilidade**. Cada funcionalidade é desenvolvida pensando na experiência do usuário final e na facilidade de manutenção pelo time de desenvolvimento.

**Próximos passos**: Implementar autenticação, APIs reais e deploy em produção. 