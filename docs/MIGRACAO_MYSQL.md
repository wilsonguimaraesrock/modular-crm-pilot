# 🚀 Guia de Migração para MySQL na DigitalOcean

Este guia documenta como migrar o sistema CRM Rockfeller do localStorage para o banco MySQL na DigitalOcean.

## 📋 **Status da Migração**

### ✅ **Concluído:**
- [x] Configuração do Prisma ORM
- [x] Schema do banco de dados criado
- [x] Migração inicial executada
- [x] Dados base migrados (escolas, vendedores, fontes de leads)
- [x] Novo contexto de autenticação criado
- [x] Scripts de migração configurados

### 🔄 **Próximos Passos:**
- [ ] Testar funcionalidades com banco MySQL
- [ ] Migrar dados do localStorage (se existirem)
- [ ] Atualizar App.tsx para usar novo contexto
- [ ] Remover dependência do localStorage

---

## 🔧 **Configuração Técnica**

### **Banco de Dados:**
```
Host: db-mysql-nyc3-39437-do-user-7944312-0.b.db.ondigitalocean.com
Porto: 25060
Database: crm_wade
SSL: Obrigatório
```

### **Tabelas Criadas:**
- `schools` - Escolas (2 registros)
- `sellers` - Vendedores (2 registros)  
- `lead_sources` - Fontes de leads (8 registros)
- `leads` - Leads
- `appointments` - Agendamentos
- `qualification_conversations` - Conversas IA
- `follow_ups` - Follow-ups
- `tasks` - Tarefas

---

## 📊 **Dados Migrados**

### **Escolas:**
1. **Rockfeller Sede** (ID: '1')
   - Email: admin@rockfeller.com.br
   - Senha: admin123

2. **Rockfeller Navegantes** (ID: '2')
   - Email: admin@navegantes.com.br
   - Senha: navegantes123

### **Vendedores:**
1. **Ricardo Silva Santos** → Sede
   - Email: ricardo@rockfeller.com.br
   - Senha: ricardo123

2. **Tatiana Venga** → Navegantes  
   - Email: tatiana.direito@hotmail.com
   - Senha: tatiana123

### **Fontes de Leads:**
- Website, Facebook Ads, Instagram, LinkedIn (para cada escola)

---

## 🛠 **Scripts Disponíveis**

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Popular banco com dados base
npm run db:seed

# Resetar banco (cuidado!)
npm run db:reset

# Abrir Prisma Studio
npm run db:studio

# Deploy em produção
npm run db:deploy
```

---

## 🔄 **Como Migrar Dados do LocalStorage**

### **Opção 1: Interface Visual**
1. Acesse o sistema 
2. Vá em Configurações → Migração MySQL
3. Clique em "Migrar para MySQL"
4. Aguarde conclusão
5. Limpe localStorage após confirmação

### **Opção 2: Console do Navegador**
```javascript
// 1. Verificar dados no localStorage
const localData = {
  leads: JSON.parse(localStorage.getItem('crm_leads') || '[]'),
  appointments: JSON.parse(localStorage.getItem('crm_appointments') || '[]'),
  // ... outros dados
};

console.log('Dados para migrar:', localData);

// 2. Após migração, limpar localStorage
localStorage.clear();
```

---

## ⚡ **Ativando o Banco MySQL**

### **1. Atualizar App.tsx:**
```typescript
// Trocar de:
import { AuthProvider } from '@/contexts/AuthContext';

// Para:
import { DatabaseAuthProvider } from '@/contexts/DatabaseAuthContext';

// E usar:
<DatabaseAuthProvider>
  {/* resto da aplicação */}
</DatabaseAuthProvider>
```

### **2. Atualizar hooks nos componentes:**
```typescript
// Trocar de:
import { useAuth } from '@/contexts/AuthContext';

// Para:
import { useDatabaseAuth } from '@/contexts/DatabaseAuthContext';
```

---

## 🔍 **Verificação da Migração**

### **1. Testar Conexão:**
```bash
npx prisma db:seed
```

### **2. Verificar Dados:**
```bash
npx prisma studio
```

### **3. Testar Login:**
- Escola: admin@navegantes.com.br / navegantes123
- Vendedor: tatiana.direito@hotmail.com / tatiana123

---

## 🚨 **Problemas Comuns**

### **Erro de Conexão:**
```bash
# Verificar .env
DATABASE_URL="mysql://doadmin:ljvyOpSKsbXnyf90@..."

# Testar conexão
npx prisma db:migrate status
```

### **Schema fora de sincronia:**
```bash
npx prisma db:push
```

### **Dados duplicados:**
```bash
npx prisma migrate reset
npm run db:seed
```

---

## 📈 **Benefícios da Migração**

### **Antes (LocalStorage):**
- ❌ Limitado ao navegador
- ❌ Dados perdidos ao limpar cache
- ❌ Sem backup automático
- ❌ Não escalável

### **Depois (MySQL):**
- ✅ Dados persistentes na nuvem
- ✅ Backup automático DigitalOcean
- ✅ Acesso de qualquer dispositivo
- ✅ Escalável para múltiplos usuários
- ✅ Relatórios avançados
- ✅ Integração com APIs

---

## 🔐 **Segurança**

### **Conexão SSL:**
- Todas as conexões são criptografadas
- Certificados válidos da DigitalOcean

### **Credenciais:**
- Senhas em hash (produção)
- Variáveis de ambiente (.env)
- Acesso restrito por IP (opcional)

---

## 📞 **Suporte**

Em caso de problemas:
1. Verificar logs no console
2. Testar conexão com `npx prisma studio`
3. Revisar arquivo `.env`
4. Verificar status da DigitalOcean

---

## 🎯 **Próximas Funcionalidades**

Com o banco MySQL ativo, será possível implementar:
- Relatórios avançados com SQL
- Backup automático
- Múltiplos usuários simultâneos  
- API para integrações
- Dashboard em tempo real
- Notificações push
- Sincronização offline

---

**Status:** ✅ Migração básica concluída  
**Próximo passo:** Ativar o DatabaseAuthContext no App.tsx 