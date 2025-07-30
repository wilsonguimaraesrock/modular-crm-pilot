# Migração CRM Rockfeller: Vite → Next.js

## Resumo das Mudanças Realizadas

### Data: [Data Atual]
### Objetivo: Migrar o CRM Rockfeller de Vite para Next.js mantendo todas as funcionalidades

---

## 1. Configuração Inicial do Next.js

### 1.1 Estrutura de Pastas Criada
```
src/app/
├── api/                    # API Routes do Next.js
├── globals.css            # Estilos globais
├── layout.tsx             # Layout principal
├── page.tsx               # Página inicial
└── test/                  # Página de testes
```

### 1.2 Configuração do Next.js
**Arquivo:** `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração experimental para App Router
  experimental: {
    appDir: true,
  },
  // Configuração de imagens
  images: {
    domains: ['localhost'],
  },
  // Configuração de webpack para compatibilidade
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
```

### 1.3 Dependências Atualizadas
**Arquivo:** `package.json`
```json
{
  "dependencies": {
    "next": "^15.4.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@prisma/client": "^5.22.0",
    "prisma": "^5.22.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 2. Migração da Autenticação

### 2.1 Problema Identificado
- O contexto de autenticação estava usando Prisma diretamente no cliente
- Next.js não permite uso direto do Prisma no lado do cliente

### 2.2 Solução: API Routes para Autenticação

**Arquivo:** `src/app/api/auth/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuração de usuários hardcoded para autenticação
const PASSWORDS = {
  // Escola Rockfeller Sede
  'admin@rockfeller.com.br': 'admin123',
  'ricardo@rockfeller.com.br': 'ricardo123',
  
  // Escola Rockfeller Navegantes
  'admin@navegantes.com.br': 'navegantes123',
  'tatiana.direito@hotmail.com': 'tatiana123',
};

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validação das credenciais
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificação das credenciais hardcoded
    if (PASSWORDS[email] !== password) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Busca informações do usuário no banco
    const user = await prisma.sellers.findFirst({
      where: { email },
      include: { school: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        school: user.school,
      },
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### 2.3 API Route para Dados
**Arquivo:** `src/app/api/data/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Busca todos os dados necessários para o CRM
    const [
      schools,
      leadSources,
      qualificationConversations,
      sellers,
      followUps,
      appointments,
      tasks,
      leads,
    ] = await Promise.all([
      prisma.schools.findMany(),
      prisma.leadSources.findMany(),
      prisma.qualificationConversations.findMany(),
      prisma.sellers.findMany(),
      prisma.followUps.findMany(),
      prisma.appointments.findMany(),
      prisma.tasks.findMany(),
      prisma.leads.findMany(),
    ]);

    return NextResponse.json({
      schools,
      leadSources,
      qualificationConversations,
      sellers,
      followUps,
      appointments,
      tasks,
      leads,
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
```

### 2.4 Contexto de Autenticação Atualizado
**Arquivo:** `src/contexts/AuthContext.tsx`
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  schoolId: string;
  school: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função de login usando API Routes
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Erro no login:', error);
        return false;
      }

      const data = await response.json();
      setUser(data.user);
      
      // Salva no localStorage para persistência
      localStorage.setItem('crm_user', JSON.stringify(data.user));
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('crm_user');
  };

  // Carrega usuário do localStorage na inicialização
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
```

---

## 3. Configuração do Banco de Dados

### 3.1 Schema Prisma
**Arquivo:** `prisma/schema.prisma`
```prisma
// Configuração do banco de dados
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Modelos do banco de dados
model schools {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  address   String?
  createdAt DateTime @default(now())

  // Relacionamentos
  sellers                    sellers[]
  leads                      leads[]
  leadSources               lead_sources[]
  tasks                     tasks[]
  followUps                 follow_ups[]
  appointments              appointments[]
  qualificationConversations qualification_conversations[]
}

model sellers {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  phone    String?
  role     String @default("seller")
  schoolId String
  active   Boolean @default(true)
  createdAt DateTime @default(now())

  // Relacionamentos
  school   schools @relation(fields: [schoolId], references: [id])
  leads    leads[]
  tasks    tasks[]
  followUps follow_ups[]
  appointments appointments[]
  qualificationConversations qualification_conversations[]
}

// ... outros modelos (leads, tasks, etc.)
```

### 3.2 Configuração do Cliente Prisma
**Arquivo:** `src/lib/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';

// Cliente Prisma global para evitar múltiplas instâncias
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## 4. Migração das Variáveis de Ambiente

### 4.1 Mudança de Prefixo
- **Antes:** `VITE_*` (Vite)
- **Depois:** `NEXT_PUBLIC_*` (Next.js)

**Arquivo:** `.env.local`
```env
# Configuração do banco de dados
DATABASE_URL="mysql://root:root@localhost:3306/crm_wade"

# Configuração do WAHA (WhatsApp HTTP API)
NEXT_PUBLIC_WAHA_BASE_URL=http://localhost:3001

# Outras configurações
NEXT_PUBLIC_APP_NAME=CRM Rockfeller
NEXT_PUBLIC_APP_VERSION=2.0.0
```

### 4.2 Atualização das Referências
Todos os arquivos que usavam `process.env.VITE_*` foram atualizados para `process.env.NEXT_PUBLIC_*`.

---

## 5. Integração WhatsApp (WAHA)

### 5.1 Configuração do WAHA
- **Porta:** 3001 (separada do CRM que roda na 3000)
- **Docker:** Container WAHA configurado corretamente
- **URLs:** Atualizadas para apontar para localhost:3001

### 5.2 Componente WhatsApp Atualizado
**Arquivo:** `src/components/crm/WhatsAppIntegration.tsx`

#### Principais Melhorias:
1. **Correção de URLs:** Substituição de `localhost:3000` por `localhost:3001`
2. **Player de Áudio Customizado:** Para resolver problemas de reprodução
3. **Cache de Avatars:** Para evitar flickering
4. **Scroll Inteligente:** Não força scroll automático
5. **Fallback para Mídia:** Links clicáveis quando mídia não carrega

```typescript
// Exemplo de correção de URL
const correctWahaUrl = (url: string) => {
  if (!url) return url;
  // Corrige URLs que apontam para a porta errada
  return url.replace('localhost:3000', 'localhost:3001');
};

// Player de áudio customizado
const AudioPlayer = ({ src }: { src: string }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ... lógica do player
};
```

---

## 6. Layout e Navegação

### 6.1 Layout Principal
**Arquivo:** `src/app/layout.tsx`
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CRM Rockfeller',
  description: 'Sistema de CRM para escolas Rockfeller',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
```

### 6.2 Página Principal
**Arquivo:** `src/app/page.tsx`
```typescript
'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { DatabaseAuthProvider } from '@/contexts/DatabaseAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Index from '@/pages/Index';

export default function Home() {
  return (
    <AuthProvider>
      <DatabaseAuthProvider>
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      </DatabaseAuthProvider>
    </AuthProvider>
  );
}
```

---

## 7. Problemas Resolvidos

### 7.1 Erro de ES Modules
- **Problema:** Configuração do Next.js com ES modules
- **Solução:** Renomeação de `next.config.js` para `next.config.mjs`

### 7.2 Autenticação
- **Problema:** Prisma no cliente
- **Solução:** API Routes para autenticação

### 7.3 WhatsApp Integration
- **Problema:** URLs incorretas e problemas de mídia
- **Solução:** Correção de URLs e player customizado

### 7.4 Scroll Automático
- **Problema:** Scroll irritante sempre indo para o final
- **Solução:** Scroll inteligente que respeita a posição do usuário

---

## 8. Comandos Utilizados

```bash
# Instalação do Next.js
npm install next@latest react@latest react-dom@latest

# Configuração do Prisma
npx prisma generate
npx prisma db push

# Execução do projeto
npm run dev

# Docker WAHA
docker run -d --name waha -p 3001:3000 whatsapp-http-api
```

---

## 9. Próximos Passos

1. **Testes:** Implementar testes automatizados
2. **Performance:** Otimizar carregamento de dados
3. **Segurança:** Implementar JWT para autenticação
4. **Deploy:** Configurar para produção
5. **Monitoramento:** Adicionar logs e métricas

---

## 10. Arquivos Modificados/Criados

### Novos Arquivos:
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/api/auth/route.ts`
- `src/app/api/data/route.ts`
- `next.config.mjs`

### Arquivos Modificados:
- `src/contexts/AuthContext.tsx`
- `src/components/crm/WhatsAppIntegration.tsx`
- `package.json`
- `.env.local`
- `prisma/schema.prisma`

### Arquivos Removidos:
- `vite.config.ts`
- `src/main.tsx`
- `index.html`

---

## 11. Considerações Finais

A migração foi bem-sucedida, mantendo todas as funcionalidades do CRM original. As principais melhorias incluem:

1. **Arquitetura mais robusta** com API Routes
2. **Melhor separação** entre cliente e servidor
3. **Integração WhatsApp** mais estável
4. **Performance melhorada** com Next.js
5. **Manutenibilidade** aumentada

O sistema está pronto para uso em desenvolvimento e pode ser facilmente adaptado para produção. 