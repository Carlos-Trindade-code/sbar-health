# SBAR Global - Guia Técnico para Desenvolvedores

## Visão Geral do Projeto

O SBAR Global é uma plataforma de inteligência clínica construída com stack moderna. Este guia contém todas as informações necessárias para rodar, modificar e dar manutenção no sistema.

---

## 1. Requisitos do Sistema

| Requisito | Versão Mínima | Recomendada |
|-----------|---------------|-------------|
| Node.js | 18.x | 22.x |
| pnpm | 8.x | 10.x |
| MySQL | 8.0 | 8.0+ ou TiDB |
| Git | 2.x | Última |

---

## 2. Stack Tecnológica

### Frontend
- **React 19** - Framework UI
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Radix UI** - Componentes acessíveis (shadcn/ui)
- **Wouter** - Roteamento
- **TanStack Query** - Cache e estado do servidor
- **Framer Motion** - Animações
- **Recharts** - Gráficos

### Backend
- **Express 4** - Servidor HTTP
- **tRPC 11** - API type-safe
- **Drizzle ORM** - Banco de dados
- **MySQL/TiDB** - Persistência
- **Jose** - JWT/Auth
- **Zod** - Validação

### DevOps
- **Vite 7** - Build tool
- **Vitest** - Testes
- **ESBuild** - Bundling do servidor

---

## 3. Estrutura de Pastas

```
sbar-global/
├── client/                 # Frontend React
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── MorningBrief.tsx
│   │   │   ├── TigerReaction.tsx
│   │   │   ├── TeamInviteSystem.tsx
│   │   │   └── ...
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilitários (trpc.ts)
│   │   ├── pages/         # Páginas/rotas
│   │   │   ├── Home.tsx   # Landing page
│   │   │   ├── Demo.tsx   # App principal (demo)
│   │   │   └── ...
│   │   ├── App.tsx        # Roteamento principal
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Estilos globais + tema
│   └── index.html
├── server/                 # Backend Express
│   ├── _core/             # Infraestrutura (NÃO EDITAR)
│   │   ├── index.ts       # Entry point do servidor
│   │   ├── context.ts     # Contexto tRPC
│   │   ├── env.ts         # Variáveis de ambiente
│   │   ├── llm.ts         # Integração LLM
│   │   └── ...
│   ├── db.ts              # Queries do banco
│   ├── routers.ts         # Procedures tRPC
│   ├── storage.ts         # Upload S3
│   └── *.test.ts          # Testes
├── drizzle/               # Schema do banco
│   ├── schema.ts          # Definição das tabelas
│   └── migrations/        # Migrações geradas
├── shared/                # Código compartilhado
├── docs/                  # Documentação
├── package.json
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

---

## 4. Instalação e Setup

### 4.1 Clonar e Instalar Dependências

```bash
# Clonar o repositório
git clone <url-do-repo>
cd sbar-global

# Instalar dependências
pnpm install
```

### 4.2 Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados (OBRIGATÓRIO)
DATABASE_URL=mysql://usuario:senha@host:3306/sbar_global

# Autenticação (OBRIGATÓRIO)
JWT_SECRET=sua-chave-secreta-muito-longa-e-segura

# OAuth Manus (se usar autenticação Manus)
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login

# LLM/IA (opcional - para análises de IA)
BUILT_IN_FORGE_API_URL=https://api.forge.manus.im
BUILT_IN_FORGE_API_KEY=sua-chave-api

# Storage S3 (opcional - para uploads)
S3_BUCKET=seu-bucket
S3_REGION=us-east-1
S3_ACCESS_KEY=sua-access-key
S3_SECRET_KEY=sua-secret-key
```

### 4.3 Configurar Banco de Dados

```bash
# Gerar e aplicar migrações
pnpm db:push
```

### 4.4 Rodar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Acesse http://localhost:3000
```

### 4.5 Build para Produção

```bash
# Build do frontend e backend
pnpm build

# Rodar em produção
pnpm start
```

---

## 5. Schema do Banco de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Usuários do sistema (médicos, enfermeiros, etc.) |
| `hospitals` | Hospitais cadastrados |
| `teams` | Equipes médicas |
| `team_members` | Membros das equipes |
| `patients` | Pacientes |
| `admissions` | Internações (paciente + hospital + equipe) |
| `evolutions` | Evoluções SBAR |
| `ai_predictions` | Predições de IA |
| `notifications` | Notificações do sistema |
| `subscriptions` | Planos e assinaturas |
| `activity_logs` | Logs de atividade |

### Relacionamentos

```
users ──┬── team_members ──── teams ──── hospitals
        │
        └── evolutions ──── admissions ──┬── patients
                                         └── hospitals
```

### Roles de Usuário

- `user` - Usuário comum (médico/enfermeiro)
- `admin` - Administrador do sistema
- `hospital_admin` - Administrador de hospital

### Planos

- `free` - Gratuito (10 pacientes, 3 membros)
- `pro` - Profissional (100 pacientes, ilimitado)
- `enterprise` - Empresarial (ilimitado)

---

## 6. API tRPC

### Estrutura de Procedures

As procedures estão em `server/routers.ts`:

```typescript
// Procedure pública (sem autenticação)
publicProcedure.query(...)

// Procedure protegida (requer login)
protectedProcedure.query(...)
protectedProcedure.mutation(...)
```

### Principais Endpoints

| Procedure | Tipo | Descrição |
|-----------|------|-----------|
| `auth.me` | query | Retorna usuário logado |
| `auth.logout` | mutation | Faz logout |
| `patients.list` | query | Lista pacientes |
| `evolutions.create` | mutation | Cria evolução SBAR |
| `ai.analyze` | mutation | Análise de IA |

### Consumindo no Frontend

```typescript
// Query
const { data, isLoading } = trpc.patients.list.useQuery();

// Mutation
const mutation = trpc.evolutions.create.useMutation();
await mutation.mutateAsync({ ... });
```

---

## 7. Componentes Principais

### MorningBrief
Painel de resumo do dia no dashboard. Mostra pacientes críticos, altas pendentes e progresso de evoluções.

### TigerReaction
Sistema de reações do mascote Dr. Tigre. Feedback visual animado após ações do usuário.

```typescript
import { useTigerReaction } from '@/components/TigerReaction';

const { showReaction } = useTigerReaction();
showReaction('happy', 'Evolução salva!', 'Paciente atualizado');
```

### TeamInviteSystem
Gerenciamento de equipes com hierarquia de permissões (Admin, Editor, Leitor, Usuário de Dados).

### DashboardLayout
Layout padrão para páginas internas com sidebar e navegação.

---

## 8. Temas e Estilos

### Cores do Tema (index.css)

```css
:root {
  --primary: oklch(0.47 0.15 160);     /* Verde SBAR */
  --secondary: oklch(0.95 0.02 160);
  --accent: oklch(0.75 0.18 85);       /* Amarelo/Laranja */
  --destructive: oklch(0.55 0.2 25);   /* Vermelho */
}
```

### Animações Customizadas

- `tiger-bounce` - Animação de pulo do mascote
- `tiger-wiggle` - Animação de comemoração
- `tiger-pulse` - Animação de pensamento
- `float` - Flutuação suave

---

## 9. Testes

### Rodar Testes

```bash
# Todos os testes
pnpm test

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

### Estrutura de Testes

Os testes ficam em `server/*.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

---

## 10. Deploy

### Variáveis de Ambiente em Produção

Todas as variáveis do `.env` devem estar configuradas no ambiente de produção.

### Build e Start

```bash
pnpm build
pnpm start
```

### Docker (opcional)

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install && pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

---

## 11. Troubleshooting

### Erro de Conexão com Banco

Verifique se `DATABASE_URL` está correto e o banco está acessível.

### Erro de Autenticação

Verifique `JWT_SECRET` e as variáveis OAuth.

### Erro de Build

```bash
# Limpar cache e reinstalar
rm -rf node_modules .pnpm-store
pnpm install
```

### Erro de Migrações

```bash
# Recriar migrações
rm -rf drizzle/migrations
pnpm db:push
```

---

## 12. Contato e Suporte

Para dúvidas técnicas sobre o código, consulte:
- Este documento
- Comentários no código
- README.md do template original

---

*Documento gerado em 31/01/2026*
*SBAR Global v1.0.0*
