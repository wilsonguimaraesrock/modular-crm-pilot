# 📖 CRM Inteligente - Guia de Uso Completo

## 🚀 **Bem-vindo ao CRM Inteligente!**

Este guia irá te ensinar a usar todas as funcionalidades do sistema passo a passo, desde a configuração inicial até o gerenciamento completo de leads.

---

## 🎯 **Primeiro Acesso - Setup Inicial**

### **Passo 1: Acessar o Sistema**
1. **Abra seu navegador** (Chrome, Firefox, Safari, Edge)
2. **Digite a URL**: `http://localhost:8081` 
3. **Aguarde o carregamento** - você verá a tela inicial do CRM

### **Passo 2: Conhecer a Interface**
A tela principal possui:
- **Menu lateral esquerdo**: Navegação entre módulos
- **Área principal**: Conteúdo do módulo ativo
- **Cabeçalho**: Título e informações do sistema

---

## 🧭 **Navegação - Menu Principal**

O menu lateral possui **6 módulos principais**:

1. **📊 Dashboard** - Visão geral e métricas
2. **👥 Captura de Leads** - Adicionar novos leads
3. **🤖 Qualificação IA** - Conversar com IA para qualificar
4. **📅 Agendamento** - Marcar reuniões
5. **💬 WhatsApp** - Enviar mensagens
6. **⚙️ Configurações** - Gerenciar sistema

**Para navegar**: Clique em qualquer item do menu lateral

---

## 📊 **Módulo 1: Dashboard**

### **O que você verá:**
- **Cards de estatísticas** com números importantes
- **Pipeline visual** mostrando o funil de vendas
- **Status do sistema**

### **Como interpretar:**
- **Leads Capturados**: Total de leads no sistema
- **Qualificados pela IA**: Leads já avaliados
- **Reuniões Agendadas**: Compromissos marcados
- **Enviados WhatsApp**: Mensagens enviadas

### **Ações disponíveis:**
- **"Capturar Primeiro Lead"**: Vai para módulo de Captura
- **"Configurar Integrações"**: Vai para Configurações

---

## 👥 **Módulo 2: Captura de Leads**

### **Como adicionar um novo lead:**

#### **Passo 1: Preencher o Formulário**
1. **Clique na aba "Capturar Lead"**
2. **Preencha os campos obrigatórios**:
   - ✅ **Nome** (obrigatório)
   - ✅ **E-mail** (obrigatório)
   - Telefone (opcional)
   - Empresa (opcional)
   - Cargo (opcional)
   - Interesses (opcional)

#### **Passo 2: Escolher a Fonte**
- **Website**: Lead veio do site
- **Facebook Ads**: Lead do Facebook
- **Instagram**: Lead do Instagram  
- **LinkedIn**: Lead do LinkedIn

#### **Passo 3: Configurar Opções**
- **Auto-qualificação**: Deixe marcado para IA avaliar automaticamente

#### **Passo 4: Salvar**
- **Clique em "Capturar Lead"**
- **Aguarde a confirmação** (toast verde aparecerá)

### **Visualizar Fontes de Leads:**
1. **Clique na aba "Fontes"**
2. **Veja os cards** com estatísticas de cada fonte
3. **Observe os contadores** de leads por fonte

### **Ver Leads Recentes:**
1. **Clique na aba "Leads Recentes"**
2. **Veja a lista** dos últimos leads capturados
3. **Observe as informações** de cada lead

---

## 🤖 **Módulo 3: Qualificação IA**

### **Sistema de Distribuição Automática:**
**🎯 NOVIDADE**: O sistema agora distribui automaticamente os leads entre os vendedores de forma equitativa!

- **Automático**: Quando você iniciar uma qualificação, o sistema escolhe o vendedor com menos leads
- **Equitativo**: Garante que todos os vendedores recebam oportunidades iguais
- **Personalizado**: A conversa começa com o nome do vendedor atribuído
- **Visual**: Você verá qual vendedor foi atribuído durante a qualificação

### **Configuração Inicial (primeira vez):**

#### **Passo 1: Configurar ChatGPT**
1. **Acesse o módulo "Qualificação IA"**
2. **Você verá um card azul** de configuração
3. **Insira sua API Key do ChatGPT**:
   - Vá para [OpenAI](https://platform.openai.com/api-keys)
   - Crie uma conta e gere uma API key
   - Cole no campo "API Key do ChatGPT"
4. **Clique em "Configurar API"**
5. **Aguarde confirmação**

### **Como qualificar um lead:**

#### **Passo 1: Iniciar Conversa Inteligente**
1. **Clique em "Iniciar Qualificação Inteligente"**
2. **O sistema automaticamente**:
   - Seleciona o vendedor com menos leads
   - Inicia com apresentação personalizada
   - Exibe o vendedor atribuído no painel verde
3. **A IA começa** com: "Olá, tudo bem? Eu sou [Nome] da [Nome da Escola]!"

#### **Passo 2: Conversar de Forma Natural**
1. **A IA fará 3 perguntas simples** e conversacionais:
   - **Interesse**: "Qual é o seu principal objetivo com o inglês?"
   - **Disponibilidade**: "Quando você gostaria de começar?"
   - **Agendamento**: "Que tal conversarmos melhor? Posso agendar uma conversa rápida?"

2. **Características da nova abordagem**:
   - ✅ **Linguagem natural** e amigável
   - ✅ **Aceita respostas gerais** (não exige detalhes)
   - ✅ **Foco no agendamento**, não na qualificação técnica
   - ✅ **Usa emojis** para ser mais humana
   - ✅ **Indicador de digitação** realista (3 segundos)

3. **Responda naturalmente** como se fosse o lead interessado
4. **A IA será mais flexível** e direcionará para agendamento

#### **Passo 3: Acompanhar Progresso da Conversa**
- **Observe os 3 estágios** na parte inferior:
  - **Interesse**: Motivação do lead
  - **Disponibilidade**: Quando quer começar
  - **Agendamento**: Aceita conversar
- **Cada estágio tem**: Nome, barra de progresso, pontuação
- **Cores indicam qualidade**:
  - **Vermelho**: Baixa qualificação (0-39)
  - **Azul**: Qualificação média (40-59)  
  - **Amarelo**: Boa qualificação (60-79)
  - **Verde**: Lead qualificado (80-100)

#### **Passo 4: Finalizar Qualificação**
- **Quando o score estiver satisfatório** (acima de 60)
- **Passe para o próximo módulo** (Agendamento)

---

## 📅 **Módulo 4: Agendamento**

### **Como agendar uma reunião:**

#### **Passo 1: Selecionar Data**
1. **Use o seletor de data**
2. **Escolha uma data futura**
3. **Não é possível** selecionar datas passadas

#### **Passo 2: Escolher Horário**
1. **Veja os horários disponíveis**:
   - 09:00, 10:00, 11:00
   - 14:00, 15:00, 16:00, 17:00
2. **Clique no horário desejado**
3. **O botão ficará azul** quando selecionado

#### **Passo 3: Confirmar Agendamento**
1. **Clique em "Agendar Reunião"**
2. **A reunião aparecerá** na lista abaixo
3. **Status será "Pendente"** até confirmação

### **Gerenciar Reuniões Agendadas:**
- **Veja todas as reuniões** na seção inferior
- **Status possíveis**:
  - 🟡 **Pendente**: Aguardando confirmação
  - 🟢 **Confirmado**: Reunião confirmada
- **Para cada reunião você vê**:
  - Nome do cliente
  - Data e horário
  - Status atual

---

## 💬 **Módulo 5: WhatsApp** - Sistema Completo de Conversas

### **🎯 NOVA VERSÃO**: Sistema completo de gestão WhatsApp com interface de conversas, fotos de perfil e suporte a mídias!

### **Configuração Inicial (primeira vez):**

#### **Passo 1: Configurar WAHA (WhatsApp HTTP API)**
1. **Acesse o módulo "WhatsApp"**
2. **Clique na aba "Conexão"**
3. **Você verá um card azul** de configuração
4. **Preencha os campos**:
   - **URL do WAHA**: `http://localhost:3000` (padrão)
   - **Session Name**: `default` (padrão)
   - **API Key**: Deixe vazio se não usar
   - **OpenAI API Key**: Para IA automática (opcional)
5. **Clique em "Salvar Configurações"**

#### **Passo 2: Conectar WhatsApp**
1. **Após salvar**, aguarde o sistema verificar conexão
2. **Se aparecer QR Code**: Escaneie com seu WhatsApp
3. **Status mudará para "Conectado"** (indicador verde)
4. **Download do QR**: Clique no botão para baixar o QR

### **🎮 Interface Principal - 4 Abas:**

#### **📶 Aba 1: Conexão**
**Controle total da conexão WhatsApp**

**Status Possíveis**:
- 🟢 **Conectado** (WORKING): WhatsApp funcionando
- 🟡 **Aguardando QR** (SCAN_QR_CODE): Escaneie QR Code
- 🔵 **Iniciando** (STARTING): Sistema inicializando
- 🔴 **Parado** (STOPPED): WhatsApp desconectado

**Funcionalidades**:
- ✅ **Status em tempo real** (atualização automática)
- ✅ **QR Code automático** quando necessário
- ✅ **Download do QR** para uso em outro dispositivo
- ✅ **Botões de controle**: Iniciar/Parar sessão

#### **💬 Aba 2: Conversas** - NOVA!
**Interface completa de chat com fotos de perfil**

**🖼️ Fotos de Perfil nos Avatares (NOVIDADE!)**:
- ✅ **Fotos reais** dos contatos do WhatsApp
- ✅ **Carregamento automático** das fotos de perfil
- ✅ **Cache inteligente** para melhor performance
- ✅ **Fallback para ícones** quando não há foto
- ✅ **Diferentes ícones** para contatos e grupos

**Lista de Conversas**:
1. **Visualização moderna** com fotos nos avatares
2. **Badges vermelhos** com número de mensagens não lidas
3. **Filtros inteligentes**:
   - **Individual/Todos**: Toggle para mostrar/ocultar grupos
   - **Busca**: Pesquisar por nome, ID ou número
4. **Auto-atualização** a cada 5 segundos
5. **Indicadores visuais**:
   - 🟢 **Verde**: Conversas com mensagens não lidas
   - 🔵 **Azul**: Conversa selecionada
   - 🕒 **Timestamps**: Horário da última mensagem

**Interface de Chat**:
1. **Área de mensagens** com scroll automático
2. **Suporte completo a mídias**:
   - 🎵 **Áudio**: Player nativo para mensagens de voz
   - 🖼️ **Imagens**: Visualização e download
   - 🎥 **Vídeos**: Player integrado
   - 📄 **Documentos**: Download direto
3. **Status de entrega**: ✓ (enviado), ✓✓ (entregue), ✓✓ azul (lido)
4. **Envio de mensagens** em tempo real
5. **Auto-refresh** das mensagens durante conversa ativa

**Como usar as Conversas**:
1. **Aguarde WhatsApp conectar** (status verde)
2. **Clique em "Atualizar"** para carregar conversas
3. **Use filtros** para encontrar conversas específicas
4. **Clique numa conversa** para abrir o chat
5. **Digite mensagem** na caixa inferior e pressione Enter
6. **Mensagens são marcadas como lidas** automaticamente

#### **🤖 Aba 3: IA Automática** - NOVA!
**Sistema de resposta automática inteligente**

**Configurações da IA**:
1. **Resposta Automática**: Liga/desliga sistema
2. **Horário de Funcionamento**: Define quando IA responde
3. **Máximo de Mensagens**: Limite por conversa
4. **Gatilhos de Transferência**: Palavras para passar para humano

**Base de Conhecimento**:
- ✅ **Conhecimento da Rockfeller**: Cursos, preços, modalidades
- ✅ **Respostas inteligentes** baseadas no contexto
- ✅ **Qualificação automática** de leads
- ✅ **Transferência inteligente** para vendedores

#### **📤 Aba 4: Envio Manual**
**Envio direto de mensagens para qualquer número**

**Como enviar**:
1. **Digite o número** (formato: 5511999999999)
2. **Escreva a mensagem**
3. **Clique em "Enviar"**
4. **Aguarde confirmação**

**Casos de uso**:
- ✅ **Leads qualificados**: Notificar vendedores
- ✅ **Prospecção ativa**: Mensagens para novos contatos
- ✅ **Follow-up**: Acompanhamento de propostas

### **🎨 Funcionalidades Visuais Avançadas:**

#### **Avatares Inteligentes**:
```
👤 Contatos: Foto real → Ícone azul (fallback)
👥 Grupos: Ícone verde com Users
🔴 Badge: Número de mensagens não lidas
```

#### **Player de Mídia**:
```
🎵 Áudio: [▶️ 0:00 / 1:23] Download
🖼️ Imagem: [Preview] Clique para ampliar
🎥 Vídeo: [Player nativo] Controles completos
📄 Documento: [📄 arquivo.pdf] Download
```

#### **Status de Conexão**:
```
🟢 Conectado (pulsando) | 409 conversas ativas
🟡 Aguardando QR | Escaneie para conectar
🔵 Iniciando... | Aguarde conexão
🔴 Desconectado | Clique para conectar
```

### **📱 Experiência Mobile:**
- ✅ **Design responsivo** para smartphones
- ✅ **Interface touch-friendly**
- ✅ **Performance otimizada** para dispositivos móveis

---

## ⚙️ **Módulo 6: Configurações**

### **Aba 1: Fontes de Leads** 📊

#### **Visualizar Fontes Existentes:**
1. **Acesse Configurações → Fontes de Leads**
2. **Veja todos os cards** das fontes ativas
3. **Para cada fonte você vê**:
   - Nome e ícone
   - Descrição
   - Número de leads capturados
   - Responsável designado
   - Tipo (Formulário/Integração)

#### **Ativar/Desativar Fontes:**
1. **Use o switch** no canto superior direito de cada card
2. **Verde**: Fonte ativa (capturando leads)
3. **Cinza**: Fonte inativa (não captura)

#### **Adicionar Nova Fonte:**
1. **Role até o final** da página
2. **Preencha o formulário** no card pontilhado:
   - **Nome da Fonte**: Ex: "Google Ads"
   - **Tipo**: Formulário ou Integração
   - **URL**: Link da fonte (opcional)
   - **Responsável**: Vendedor designado
   - **Descrição**: Explicação da fonte
3. **Clique em "Adicionar Fonte"**

### **Aba 2: Configuração IA** 🤖

#### **Personalizar o SDR Virtual:**
1. **Acesse a aba "Configuração IA"**
2. **Edite o prompt** na caixa de texto grande
3. **O prompt define**:
   - Como a IA se comporta
   - Que perguntas faz
   - Como qualifica leads
4. **Clique em "Salvar Configurações da IA"**

### **Aba 3: Equipe** 👥

#### **🎯 Painel de Distribuição Equitativa (NOVO!):**
**Localização**: No topo da aba Equipe, você verá um painel azul com estatísticas.

**O que mostra**:
1. **Cards por Vendedor**:
   - Nome e percentual de leads atribuídos
   - Total de leads recebidos
   - Leads recebidos hoje
   - Barra de progresso visual

2. **Como funciona**:
   - **Automático**: Sistema distribui leads sem intervenção
   - **Equitativo**: Vendedor com menos leads recebe o próximo
   - **Transparente**: Você vê a distribuição em tempo real
   - **Por escola**: Cada escola tem distribuição independente

**Exemplo do que você verá**:
```
┌─ Distribuição Equitativa de Leads ─────────────────┐
│ Carlos Silva    35%  │ Ana Santos     28%  │ João  │
│ Total: 45 leads     │ Total: 36 leads     │ etc...│
│ Hoje: 3 leads       │ Hoje: 2 leads       │       │
│ ████████░░░         │ ██████░░░░░         │       │
└─────────────────────────────────────────────────────┘
```

#### **Gerenciar Vendedores:**
1. **Veja todos os vendedores** na lista (abaixo do painel de distribuição)
2. **Para cada vendedor**:
   - Nome e foto (inicial)
   - Cargo na empresa
   - Telefone de contato
   - Status (Ativo/Inativo)
3. **Status Ativo**: Recebe leads automaticamente via distribuição equitativa
4. **Status Inativo**: Não participa da distribuição automática

#### **Adicionar Vendedor:**
1. **Clique em "Adicionar Vendedor"**
2. **Preencha as informações**
3. **Defina se estará ativo** (importante para distribuição)
4. **Vendedores ativos** automaticamente entram no sistema de distribuição

### **Aba 4: Sistema** 🔧

#### **Configurações Globais:**
1. **Horário de Funcionamento**:
   - Início: 09:00 (padrão)
   - Fim: 18:00 (padrão)
2. **Fuso Horário**: America/Sao_Paulo
3. **Funcionalidades**:
   - **Qualificação Automática**: Liga/desliga IA automática
   - **Integração WhatsApp**: Ativa/desativa WhatsApp
   - **Notificações por E-mail**: Controla e-mails

---

## 🔄 **Fluxo Completo de Trabalho**

### **Processo Ideal - Do Lead ao Fechamento:**

#### **1. Configuração Inicial** ⚙️
- [ ] Configure ChatGPT (API Key)
- [ ] Configure Chatwoot (WhatsApp)
- [ ] Revise fontes de leads ativas
- [ ] Verifique equipe de vendas

#### **2. Captura de Lead** 👥
- [ ] Acesse "Captura de Leads"
- [ ] Preencha formulário completo
- [ ] Escolha fonte correta
- [ ] Ative auto-qualificação
- [ ] Salve o lead

#### **3. Qualificação** 🤖
- [ ] Acesse "Qualificação IA"
- [ ] Inicie conversa com o lead
- [ ] Faça perguntas de qualificação
- [ ] Monitore o score (meta: 60+)
- [ ] Continue até lead estar qualificado

#### **4. Agendamento** 📅
- [ ] Acesse "Agendamento"
- [ ] Escolha data disponível
- [ ] Selecione horário
- [ ] Confirme reunião
- [ ] Verifique na lista de agendadas

#### **5. Notificação** 💬
- [ ] Acesse "WhatsApp"
- [ ] Digite número do lead
- [ ] Personalize mensagem
- [ ] Envie notificação
- [ ] Confirme entrega

#### **6. Acompanhamento** 📊
- [ ] Volte ao Dashboard
- [ ] Verifique métricas atualizadas
- [ ] Monitore pipeline
- [ ] Repita processo para novos leads

---

## 🚨 **Solução de Problemas Comuns**

### **Problema 1: "Sistema não carrega"**
**Soluções:**
1. ✅ Verifique se `npm run dev` está rodando
2. ✅ Acesse `http://localhost:8081` (não 8080)
3. ✅ Limpe cache do navegador (Ctrl+F5)
4. ✅ Teste em modo privado/anônimo

### **Problema 2: "ChatGPT não responde"**
**Soluções:**
1. ✅ Verifique se API Key está correta
2. ✅ Teste a key em outro serviço OpenAI
3. ✅ Verifique saldo da conta OpenAI
4. ✅ Reconfigure a IA nas Configurações

### **Problema 3: "WhatsApp não envia"**
**Soluções:**
1. ✅ Verifique configuração do Chatwoot
2. ✅ Teste URL + Token + Inbox ID
3. ✅ Confirme que WhatsApp está conectado no Chatwoot
4. ✅ Verifique formato do número (+55...)

### **Problema 4: "Lead não foi salvo"**
**Soluções:**
1. ✅ Preencha campos obrigatórios (Nome + E-mail)
2. ✅ Aguarde toast de confirmação
3. ✅ Verifique aba "Leads Recentes"
4. ✅ Recarregue a página se necessário

### **Problema 5: "Reunião não aparece"**
**Soluções:**
1. ✅ Selecione data E horário antes de agendar
2. ✅ Use apenas datas futuras
3. ✅ Aguarde confirmação visual
4. ✅ Role para baixo para ver lista

---

## 💡 **Dicas de Uso Avançado**

### **Para Melhor Performance:**
1. **Mantenha apenas fontes ativas** que você realmente usa
2. **Configure vendedores** apenas com status ativo se estiverem trabalhando
3. **Personalize o prompt da IA** para seu tipo de negócio
4. **Use templates** personalizados no WhatsApp

### **Para Melhor Qualificação:**
1. **Faça perguntas específicas** sobre:
   - Problema atual do cliente
   - Orçamento disponível
   - Urgência da solução
   - Quem decide a compra
2. **Monitore o score** constantemente
3. **Não force** uma qualificação baixa

### **Para Melhor Organização:**
1. **Use fontes específicas** para cada canal
2. **Atribua vendedores** por especialidade
3. **Mantenha agendas** sempre atualizadas
4. **Verifique métricas** regularmente no Dashboard

---

## 📞 **Suporte e Ajuda**

### **Em Caso de Dúvidas:**
1. **Releia** este guia passo a passo
2. **Teste** em ambiente controlado primeiro
3. **Verifique** configurações nas abas do sistema
4. **Consulte** a documentação técnica se necessário

### **Recursos Adicionais:**
- **Documentação Técnica**: `docs/DOCUMENTACAO_COMPLETA.md`
- **Guia para Desenvolvedores**: `docs/README_DESENVOLVEDORES.md`
- **Código Comentado**: `src/components/crm/AdminPanel.tsx`

---

## 🎯 **Resumo - Checklist Diário**

### **Rotina Matinal:**
- [ ] Abrir Dashboard e verificar métricas
- [ ] Revisar reuniões do dia no Agendamento
- [ ] Verificar novos leads na Captura
- [ ] Qualificar leads pendentes com IA

### **Durante o Dia:**
- [ ] Capturar novos leads conforme chegam
- [ ] Qualificar leads imediatamente
- [ ] Agendar reuniões com leads qualificados
- [ ] Enviar notificações via WhatsApp

### **Final do Dia:**
- [ ] Revisar métricas no Dashboard
- [ ] Confirmar reuniões do próximo dia
- [ ] Verificar configurações se necessário
- [ ] Planejar ações para amanhã

---

**🚀 Parabéns! Agora você domina o CRM Inteligente!**

Este sistema foi projetado para **automatizar** e **otimizar** seu processo de vendas. Use-o consistentemente e veja seus resultados melhorarem dia após dia! 💪 