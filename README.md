# 🚀 CRM Inteligente - Rockfeller Brasil

## 📋 **Visão Geral**

Sistema completo de gestão de relacionamento com clientes, desenvolvido especificamente para escolas de idiomas. Integra inteligência artificial, automação de vendas e distribuição equitativa de leads.

## ✨ **Funcionalidades Principais**

### 🎯 **Sistema de Distribuição Equitativa** *(NOVO!)*
- **Distribuição automática** de leads entre vendedores
- **Algoritmo inteligente** que garante equidade
- **Dashboard visual** com estatísticas em tempo real
- **Isolamento por escola** (cada unidade opera independentemente)

### 🤖 **Qualificação IA Conversacional** *(MELHORADO!)*
- **Abordagem natural** e amigável (não técnica)
- **3 perguntas simples** focadas no agendamento
- **Indicador de digitação** realista (3 segundos)
- **Apresentação personalizada** com nome do vendedor e escola
- **Aceita respostas gerais** (não exige detalhes específicos)
- **Foco no aquecimento** do lead para agendamento

### 📊 **Dashboard Inteligente**
- **Métricas em tempo real**: Leads capturados, qualificados, agendados
- **Pipeline visual**: Acompanhamento do funil de vendas
- **Estatísticas de distribuição**: Performance por vendedor
- **Indicadores de conversão**: Taxa de sucesso por etapa

### 📝 **Captura Multi-Fonte**
- **Formulário responsivo** com validação em tempo real
- **Múltiplas fontes**: Website, Facebook, Instagram, LinkedIn
- **Auto-atribuição** para vendedores específicos
- **Notificações automáticas** para novos leads

### 📅 **Agendamento Inteligente**
- **Calendário interativo** com horários disponíveis
- **Confirmação automática** via sistema
- **Integração com pipeline** de vendas
- **Gestão de reuniões** pendentes e confirmadas

### 💬 **Integração WhatsApp**
- **Chatwoot integration** para envio automático
- **Templates personalizáveis** de mensagem
- **Informações do lead** incluídas automaticamente
- **Score de qualificação** na mensagem

### 👥 **Gestão de Equipe**
- Cadastro e gerenciamento de vendedores
- Status ativo/inativo para distribuição
- Estatísticas individuais de performance
- Controle de atribuição de leads

### ⚙️ **Painel Administrativo**
- **Fontes de Leads**: Gestão completa de origens
- **Configuração IA**: Personalização do SDR Virtual
- **Equipe**: Gerenciamento de vendedores + estatísticas
- **Sistema**: Configurações globais

## 🚀 **Como Executar**

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn

### **Instalação**
```bash
# 1. Clonar o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Navegar para o diretório
cd CRM-ROCK-LOVABLE

# 3. Instalar dependências
npm install

# 4. Executar em desenvolvimento
npm run dev

# 5. Acessar o sistema
http://localhost:8080
```

## 🏗️ **Tecnologias Utilizadas**

- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5.4
- **UI**: shadcn/ui + Tailwind CSS
- **Animações**: Framer Motion
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Notificações**: Sonner

## 📁 **Estrutura do Projeto**

```
src/
├── components/
│   ├── crm/                 # Módulos principais do CRM
│   │   ├── AdminPanel.tsx           # Painel administrativo
│   │   ├── DashboardOverview.tsx    # Dashboard e métricas
│   │   ├── LeadCapture.tsx          # Captura de leads
│   │   ├── LeadQualification.tsx    # Qualificação com IA
│   │   ├── CalendarScheduling.tsx   # Agendamento
│   │   ├── WhatsAppIntegration.tsx  # Integração WhatsApp
│   │   └── Navigation.tsx           # Navegação
│   └── ui/                  # Componentes reutilizáveis
├── contexts/
│   └── AuthContext.tsx      # Contexto de autenticação e dados
├── hooks/                   # Custom hooks
├── lib/                     # Utilitários
└── pages/                   # Páginas da aplicação
```

## 🎯 **Algoritmo de Distribuição Equitativa**

O sistema utiliza um algoritmo inteligente para distribuir leads:

1. **Identifica vendedores ativos** da escola
2. **Conta leads atribuídos** a cada vendedor
3. **Ordena por menor quantidade** de leads
4. **Atribui ao vendedor** com menos leads
5. **Atualiza estatísticas** em tempo real

```typescript
const getNextAvailableSeller = (schoolId: string): Seller | null => {
  const activeSellers = getSellersBySchool(schoolId).filter(seller => seller.active);
  
  if (activeSellers.length === 0) return null;
  if (activeSellers.length === 1) return activeSellers[0];
  
  const schoolLeads = getLeadsBySchool(schoolId);
  const sellerLeadCounts = activeSellers.map(seller => ({
    seller,
    leadCount: schoolLeads.filter(lead => lead.assignedTo === seller.id).length
  }));
  
  sellerLeadCounts.sort((a, b) => a.leadCount - b.leadCount);
  return sellerLeadCounts[0].seller;
};
```

## 📖 **Documentação Completa**

- **Guia de Uso**: [`docs/GUIA_DE_USO_COMPLETO.md`](docs/GUIA_DE_USO_COMPLETO.md)
- **Documentação Técnica**: [`docs/DOCUMENTACAO_COMPLETA.md`](docs/DOCUMENTACAO_COMPLETA.md)
- **Guia para Desenvolvedores**: [`docs/README_DESENVOLVEDORES.md`](docs/README_DESENVOLVEDORES.md)

## 🔧 **Scripts Disponíveis**

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run build:dev    # Build de desenvolvimento
npm run lint         # Linting do código
npm run preview      # Preview da build
```

## 🎨 **Design System**

- **Tema**: Dark mode com gradientes azuis
- **Animações**: Framer Motion para transições suaves
- **Responsivo**: Funciona em desktop, tablet e mobile
- **Acessibilidade**: Componentes otimizados para screen readers

## 🚀 **Funcionalidades Implementadas**

- ✅ Dashboard com métricas em tempo real
- ✅ Captura de leads multi-fonte
- ✅ Qualificação IA com metodologia BANT
- ✅ **Sistema de distribuição equitativa de leads**
- ✅ **Apresentação personalizada com vendedor**
- ✅ **Painel de estatísticas de distribuição**
- ✅ Agendamento de reuniões
- ✅ Integração WhatsApp/WAHA
- ✅ Painel administrativo completo
- ✅ Gestão de equipe de vendas
- ✅ Navegação modular responsiva

## 🔮 **Próximas Implementações**

- [ ] Autenticação JWT completa
- [ ] API REST com banco de dados
- [ ] Integração Google Calendar
- [ ] Webhooks para integrações externas
- [ ] Relatórios avançados e analytics
- [ ] Notificações push em tempo real

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 **Suporte**

Para dúvidas ou suporte, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para Rockfeller Brasil**
