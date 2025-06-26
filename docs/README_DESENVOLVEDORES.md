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
- [x] **Qualificação IA**: Integração ChatGPT, scoring automático
- [x] **Agendamento**: Seleção de datas, slots de horário
- [x] **WhatsApp**: Integração Chatwoot, templates
- [x] **Admin Panel**: 4 abas organizadas
- [x] **Fontes de Leads**: Gestão completa (NOVA FUNCIONALIDADE)
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
│   ├── WhatsAppIntegration.tsx     # 💬 WhatsApp/Chatwoot
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

## 🔄 **Fluxo de Estados**

### **Pipeline de Leads**
```
1. LeadCapture → Cria lead
2. LeadQualification → Adiciona score
3. CalendarScheduling → Agenda reunião  
4. WhatsAppIntegration → Envia notificação
```

### **Estados Globais**
```typescript
// Dashboard - Métricas gerais
stats: { leadsCapturados, qualificadosIA, reunioesAgendadas, enviadosWhatsApp }
pipeline: { novosLeads, qualificados, agendados, fechados }

// AdminPanel - Configurações
leadSources: Array<SourceConfig>    // Fontes de leads
salesTeam: Array<TeamMember>        // Equipe de vendas
aiPrompt: string                    // Prompt da IA
systemSettings: SystemConfig        // Configurações globais
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