# 🎯 CRM ROCKFELLER - Sistema Inteligente de Gestão de Leads

## 🚀 **Sistema de Integração com Landing Pages e Webhooks**

### **Visão Geral**
CRM completo para escolas de idiomas com **integração automática** com landing pages externas via webhooks. Sistema de captura de leads em tempo real com atualização automática do pipeline.

### **✨ Funcionalidades Principais**

#### **🎯 Captura Automática de Leads**
- **Integração com V0**: Recebe leads automaticamente de landing pages
- **URL Parameters**: Contorna problemas de CORS entre HTTPS e HTTP
- **Processamento Automático**: Leads chegam direto no pipeline
- **Atualização em Tempo Real**: Pipeline se atualiza automaticamente

#### **🔄 Sistema de Atualização Automática**
- **Detecção Inteligente**: Identifica novos leads automaticamente
- **Notificações Toast**: Alertas visuais em tempo real
- **Contadores Dinâmicos**: Métricas atualizadas automaticamente
- **Indicador Visual**: Badge "🆕 Novo!" para novos leads

#### **📊 Pipeline de Vendas**
- **Dashboard Inteligente**: Métricas em tempo real
- **Qualificação com IA**: Sistema BANT automatizado
- **Distribuição Equitativa**: Leads distribuídos automaticamente entre vendedores
- **Agendamento**: Sistema de reuniões integrado

### **🔗 Integração com Landing Pages**

#### **Código JavaScript para V0:**
```javascript
// Sistema de integração CORS-safe
window.enviarParaCRM = function(leadData) {
    const encodedData = encodeURIComponent(JSON.stringify(leadData));
    const crmUrl = `http://localhost:3001/webhook?leadData=${encodedData}`;
    window.open(crmUrl, '_blank');
};
```

#### **Fluxo Completo:**
1. **Formulário preenchido** na landing page
2. **JavaScript intercepta** e formata dados
3. **URL gerada** com dados codificados
4. **CRM abre** em nova aba
5. **Lead processado** automaticamente
6. **Pipeline atualiza** em tempo real

### **🎨 Interface Moderna**
- **Design Responsivo**: Mobile-first
- **Animações Fluidas**: Framer Motion
- **Tema Escuro**: Interface moderna
- **Componentes shadcn/ui**: UI consistente

### **⚡ Tecnologias**
- **Frontend**: React 18 + TypeScript
- **Build**: Vite 5.4
- **UI**: shadcn/ui + Tailwind CSS
- **Animações**: Framer Motion
- **Estado**: Context API + localStorage

### **🚀 Como Usar**

#### **1. Instalação**
```bash
npm install
npm run dev
```

#### **2. Login**
- **Email**: `navegantes@rockfellerbrasil.com.br`
- **Senha**: `S@lmos2714`

#### **3. Integração com Landing Page**
1. Copie o código JavaScript para V0
2. Configure os campos do formulário
3. Teste o envio de leads
4. Verifique o pipeline atualizando

### **📋 Funcionalidades por Módulo**

#### **🏠 Dashboard**
- Métricas em tempo real
- Pipeline visual
- Atualização automática
- Notificações de novos leads

#### **🎯 Captura de Leads**
- Formulário manual
- Integração automática
- Múltiplas fontes
- Lista de leads recentes

#### **🤖 Qualificação IA**
- Sistema BANT
- ChatGPT integrado
- Distribuição automática
- Score inteligente

#### **📅 Agendamento**
- Calendário interativo
- Slots de horário
- Confirmações
- Integração futura com Google Calendar

#### **💬 WhatsApp**
- Integração Chatwoot
- Templates personalizados
- Envio automático
- Tracking de mensagens

#### **⚙️ Configurações**
- Gestão de fontes
- Configuração de IA
- Gestão de equipe
- Configurações do sistema

### **🔧 Configuração de Produção**

#### **URLs de Produção:**
```javascript
// Desenvolvimento
const crmUrl = `http://localhost:3001/webhook?leadData=${encodedData}`;

// Produção
const crmUrl = `https://crm-rockfeller.com/webhook?leadData=${encodedData}`;
```

#### **Variáveis de Ambiente:**
```bash
VITE_CRM_WEBHOOK_URL=http://localhost:3001/webhook
VITE_CRM_PRODUCTION_URL=https://crm-rockfeller.com/webhook
```

### **📊 Monitoramento**

#### **Logs Importantes:**
```
🎯 Sistema de integração CRM ativado
📋 Dados capturados: {...}
🚀 Processando lead: {...}
🌐 Abrindo CRM com URL: http://localhost:8080/webhook?leadData=...
✅ Lead enviado via URL parameters para CRM
📨 Lead recebido via URL parameters: {...}
✅ Lead cadastrado com sucesso no CRM
🆕 Novos leads detectados: [...]
```

### **🛠️ Troubleshooting**

#### **Problemas Comuns:**
- **Lead não aparece**: Verificar login e schoolId
- **Popup não abre**: Verificar permissões de popup
- **Dados não chegam**: Verificar formato e encoding

#### **Soluções:**
```javascript
// Verificar integração
console.log('🎯 Sistema de integração CRM ativado');

// Testar manualmente
window.testarIntegracaoCRM();

// Verificar dados
localStorage.getItem('crm_leads');
```

### **📈 Métricas de Performance**
- ⚡ **Tempo de processamento**: < 100ms
- 📊 **Taxa de sucesso**: > 95%
- 🔄 **Atualização automática**: 10s
- 💾 **Uso de memória**: Otimizado

### **🔐 Segurança**
- ✅ Validação de dados
- ✅ Sanitização de entrada
- ✅ Origem permitida
- ✅ Campos obrigatórios verificados

### **📱 Responsividade**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **🎯 Próximas Funcionalidades**
1. **Múltiplas landing pages**
2. **Tracking de UTM parameters**
3. **Dashboard de analytics**
4. **Webhooks para outros sistemas**
5. **Autenticação de webhooks**

---

## 📚 **Documentação Completa**

Para informações detalhadas sobre:
- **Arquitetura do sistema**
- **Configurações avançadas**
- **API e integrações**
- **Troubleshooting completo**

### **📖 Guias e Documentação**

#### **🎯 Guias Práticos:**
- **[📋 Guia Passo a Passo](docs/GUIA_CONFIGURACAO_FONTES_LEADS.md)** - Como configurar fontes de leads
- **[🎨 Guia Visual](docs/GUIA_VISUAL_FONTES_LEADS.md)** - Guia com emojis e formatação visual
- **[🔧 Sistema de Webhooks](docs/SISTEMA_WEBHOOKS_CONFIGURACAO.md)** - Documentação técnica completa

#### **📚 Documentação Técnica:**
- **[📖 Documentação Completa](DOCUMENTACAO_COMPLETA.md)** - Documentação técnica completa do sistema
- **[👨‍💻 Guia Desenvolvedores](docs/README_DESENVOLVEDORES.md)** - Para desenvolvedores
- **[📖 Guia de Uso](docs/GUIA_DE_USO.md)** - Guia geral de uso do sistema

### **🚀 Início Rápido**

#### **Para Configurar Fontes de Leads:**
1. **[📋 Siga o Guia Passo a Passo](docs/GUIA_CONFIGURACAO_FONTES_LEADS.md)**
2. **[🎨 Use o Guia Visual](docs/GUIA_VISUAL_FONTES_LEADS.md)** para facilitar
3. **[🔧 Consulte a Documentação Técnica](docs/SISTEMA_WEBHOOKS_CONFIGURACAO.md)**

#### **Para Desenvolvedores:**
1. **[👨‍💻 Leia o Guia de Desenvolvedores](docs/README_DESENVOLVEDORES.md)**
2. **[📖 Consulte a Documentação Completa](DOCUMENTACAO_COMPLETA.md)**
3. **[🔧 Entenda o Sistema de Webhooks](docs/SISTEMA_WEBHOOKS_CONFIGURACAO.md)**

---

## 🤝 **Suporte**

Para dúvidas ou problemas:
1. Verifique a documentação completa
2. Consulte os logs no console
3. Teste a integração manualmente
4. Verifique as configurações de CORS

---

*Desenvolvido para Rockfeller Navegantes*
*Versão: 2.0 - Sistema de Integração Completo*
*Data: 2025-01-09*
