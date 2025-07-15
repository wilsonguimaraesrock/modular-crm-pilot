# 📋 GUIA PASSO A PASSO - CONFIGURAÇÃO DE FONTES DE LEADS

## 🎯 **VISÃO GERAL**

Este guia mostra como configurar fontes de leads no CRM Rockfeller de forma simples e rápida. As fontes de leads são as origens de onde os leads chegam ao sistema (landing pages, formulários, APIs, etc.).

---

## 🚀 **PASSO 1: ACESSAR O PAINEL ADMIN**

### **Como acessar:**
1. Faça login no CRM Rockfeller
2. Clique no menu lateral esquerdo
3. Selecione **"Admin"** ou **"Configurações"**
4. Você verá o painel de administração com abas

### **O que você verá:**
- Aba **"Fontes de Leads"** (primeira aba)
- Lista de fontes existentes
- Botão **"Adicionar Fonte"** no topo

---

## 📝 **PASSO 2: CRIAR UMA NOVA FONTE**

### **2.1 Preencher dados básicos:**
1. Clique no botão **"Adicionar Fonte"**
2. Preencha os campos obrigatórios:

```
Nome da Fonte: [Ex: Landing Page Principal]
Tipo: [Selecione: Formulário ou Integração]
URL: [Ex: https://minha-landing.com]
Responsável: [Selecione um vendedor]
```

### **2.2 Configurações opcionais:**
```
Descrição: [Ex: Formulário principal do site]
Atribuição Automática: [Selecione vendedor ou deixe vazio]
Notificações: [Marque se quiser receber alertas]
```

### **2.3 Salvar:**
- Clique em **"Criar Fonte"**
- Aguarde a confirmação verde
- A fonte aparecerá na lista

---

## 🔧 **PASSO 3: CONFIGURAR A FONTE**

### **3.1 Editar configurações:**
1. Na lista de fontes, clique no botão **"Editar"** (ícone de lápis)
2. Um modal abrirá com todas as configurações
3. Modifique o que precisar:

```
✅ Nome da fonte
✅ Tipo de fonte
✅ URL da origem
✅ Responsável pelos leads
✅ Descrição detalhada
✅ URL do webhook (se necessário)
✅ Ativar/desativar notificações
```

### **3.2 Salvar alterações:**
- Clique em **"Salvar Alterações"**
- Aguarde a confirmação
- O modal fechará automaticamente

---

## 📋 **PASSO 4: GERAR CÓDIGO DE INTEGRAÇÃO**

### **4.1 Abrir gerador de código:**
1. Na lista de fontes, clique no botão **"Código"** (ícone `<>`)
2. Um modal abrirá com duas abas:
   - **Formulário HTML** (para landing pages)
   - **Webhook JavaScript** (para integrações)

### **4.2 Escolher tipo de código:**

#### **Opção A: Formulário HTML**
- **Para:** Landing pages com formulário
- **O que gera:** Código HTML completo
- **Inclui:** Estilos CSS e JavaScript de envio

#### **Opção B: Webhook JavaScript**
- **Para:** Sistemas externos (Facebook, APIs)
- **O que gera:** Código JavaScript
- **Inclui:** Função de envio e exemplos

### **4.3 Copiar o código:**
1. Selecione a aba desejada
2. Clique no botão **"Copiar Código"**
3. Aguarde a confirmação verde
4. Cole o código na sua landing page ou sistema

---

## 🌐 **PASSO 5: IMPLEMENTAR NA LANDING PAGE**

### **5.1 Para formulário HTML:**
1. Abra sua landing page no editor
2. Cole o código HTML gerado
3. Substitua o formulário existente
4. Teste o envio

### **5.2 Para webhook JavaScript:**
1. Adicione o código JavaScript na sua página
2. Configure a função de envio
3. Teste a integração

---

## ✅ **PASSO 6: TESTAR A INTEGRAÇÃO**

### **6.1 Teste básico:**
1. Acesse sua landing page
2. Preencha o formulário
3. Envie os dados
4. Verifique se o lead aparece no CRM

### **6.2 Verificar no CRM:**
1. Vá para a aba **"Leads"** no CRM
2. Procure pelo lead de teste
3. Confirme se os dados estão corretos
4. Verifique se foi atribuído ao responsável correto

---

## 🔄 **PASSO 7: GERENCIAR FONTES**

### **7.1 Ativar/Desativar:**
- Use o switch ao lado de cada fonte
- **Verde = Ativa** (recebe leads)
- **Cinza = Inativa** (não recebe leads)

### **7.2 Excluir fonte:**
1. Clique no botão **"Excluir"** (ícone de lixeira)
2. Confirme a exclusão
3. A fonte será removida permanentemente

### **7.3 Duplicar fonte:**
1. Clique em **"Editar"**
2. Modifique o nome
3. Salve como nova fonte

---

## 📊 **PASSO 8: MONITORAR RESULTADOS**

### **8.1 Ver estatísticas:**
- Cada fonte mostra quantos leads gerou
- Visualize performance por período
- Compare diferentes fontes

### **8.2 Receber notificações:**
- Ative notificações na configuração
- Receba alertas de novos leads
- Configure horários de trabalho

---

## 🎯 **EXEMPLOS PRÁTICOS**

### **Exemplo 1: Landing Page Principal**
```
Nome: Landing Page Principal
Tipo: Formulário
URL: https://rockfeller.com.br/contato
Responsável: Tatiana Venga
Descrição: Formulário principal do site institucional
```

### **Exemplo 2: Facebook Lead Ads**
```
Nome: Facebook Lead Ads
Tipo: Integração
URL: https://facebook.com/ads
Responsável: João Silva
Descrição: Campanhas de Facebook Ads
```

### **Exemplo 3: Formulário WhatsApp**
```
Nome: WhatsApp Business
Tipo: Integração
URL: https://wa.me/5511999999999
Responsável: Maria Santos
Descrição: Leads via WhatsApp Business
```

---

## ❓ **PERGUNTAS FREQUENTES**

### **Q: Quantas fontes posso criar?**
**R:** Não há limite. Crie quantas precisar para organizar seus leads.

### **Q: Posso mudar o responsável depois?**
**R:** Sim! Edite a fonte e altere o responsável a qualquer momento.

### **Q: O código funciona em qualquer site?**
**R:** Sim! O código é compatível com qualquer plataforma (WordPress, Wix, etc.).

### **Q: Como saber se a integração está funcionando?**
**R:** Teste enviando um lead e verifique se aparece no CRM em tempo real.

### **Q: Posso usar a mesma fonte para múltiplas landing pages?**
**R:** Sim! Uma fonte pode ser usada em várias páginas diferentes.

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema: Lead não aparece no CRM**
**Solução:**
1. Verifique se a fonte está ativa
2. Confirme se o código foi colado corretamente
3. Teste o formulário novamente
4. Verifique os logs no console do navegador

### **Problema: Código não copia**
**Solução:**
1. Clique no botão "Copiar" novamente
2. Verifique se popups estão permitidos
3. Tente copiar manualmente selecionando o texto

### **Problema: Formulário não envia**
**Solução:**
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Confirme se o JavaScript está carregado
3. Teste em um navegador diferente

---

## 📞 **SUPORTE**

### **Precisa de ajuda?**
- **Email:** suporte@rockfeller.com.br
- **WhatsApp:** (11) 99999-9999
- **Horário:** Segunda a Sexta, 9h às 18h

### **Documentação completa:**
- Consulte o arquivo `DOCUMENTACAO_COMPLETA.md`
- Veja exemplos em `SISTEMA_WEBHOOKS_CONFIGURACAO.md`

---

## 🎉 **PARABÉNS!**

Se você seguiu todos os passos, sua fonte de leads está configurada e funcionando! 

### **Próximos passos:**
1. **Teste** a integração com leads reais
2. **Monitore** os resultados
3. **Otimize** baseado nos dados
4. **Crie** mais fontes conforme necessário

---

*Guia criado em: 2025-01-09*
*Versão: 1.0 - Guia Simplificado*
*Última atualização: 2025-01-09* 