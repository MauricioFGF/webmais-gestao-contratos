# CLAUDE.md — Gestão de Contratos (Desafio WebMais)

Este arquivo é o contexto mestre do projeto. Leia antes de executar qualquer
comando neste repositório. O objetivo é entregar um módulo funcional de Gestão
de Contratos dentro do escopo pedido — **não adicionar features fora do
checklist abaixo**, e não deixar nenhum item dele para trás.

## 1. O desafio, resumido

Cadastro de contratos vinculados a clientes, com status derivado
(`ATIVO` → `VENCIDO` automaticamente quando a data de vencimento passa, ou
→ `ENCERRADO` manualmente e de forma definitiva). Prazo alvo: 6-8h de trabalho,
código limpo > tela bonita.

## 2. Checklist de requisitos (fonte da verdade para avaliação)

### Frontend
- [ ] Login (usuário/senha fixos, seedados no banco)
- [ ] Cadastrar cliente (nome + documento)
- [ ] Listar contratos (número, cliente, valor, vencimento, status)
- [ ] Cadastrar novo contrato (com select de cliente)
- [ ] Editar contrato
- [ ] Excluir contrato
- [ ] Encerrar contrato manualmente, com feedback visual da mudança
- [ ] Resumo/contagem de contratos por status (Ativos/Vencidos/Encerrados)
- [ ] Logoff

### Backend
- [ ] Todas as operações do front expostas via API REST
- [ ] Autenticação via JWT
- [ ] Persistência em PostgreSQL, contrato relacionado a cliente
- [ ] Cache em Redis (listagem de contratos e/ou resumo por status)
- [ ] Job assíncrono BullMQ: vencer contratos automaticamente (periódico e/ou
      disparado no cadastro/consulta)

### Geral
- [ ] Git com histórico de commits organizado
- [ ] docker-compose subindo Postgres e Redis
- [ ] README explicando como rodar o projeto
- [ ] README relata uso de ferramentas de IA (Claude Code) no desenvolvimento
- [ ] Repositório no GitHub, link enviado ao RH em até 5 dias

> Antes de considerar a tarefa concluída, invoque a skill
> `verify-requirements` para conferir este checklist item a item contra o
> código real.

## 3. Stack e decisões (já confirmadas, não revisitar sem motivo forte)

| Decisão | Escolha | Por quê |
|---|---|---|
| ORM | Prisma | migrations declarativas + type-safety, produtividade em 1 dia |
| Login | Usuário fixo seedado (`admin@webmais.com` / `admin123`, hash bcrypt) | cobre o requisito mínimo sem gastar orçamento em cadastro de usuário |
| Docker | Só Postgres + Redis no compose | é exatamente o que o enunciado pede; back/front rodam via `npm run dev` local (iteração mais rápida) |
| Estrutura | Monorepo simples: `/backend` e `/frontend` irmãs na raiz, sem workspaces | 2 apps não justificam workspaces/turborepo |
| Backend framework | Express + TypeScript | simples, sem lock-in, fácil de explicar |
| Auth | JWT stateless, expiração 8h | logoff é 100% client-side (descartar token) — **não existe endpoint de logout no back, isso é esperado** |

## 4. Estrutura de pastas

```
webMais/
├── CLAUDE.md
├── README.md
├── docker-compose.yml
├── .claude/skills/verify-requirements/SKILL.md
├── backend/
│   ├── prisma/schema.prisma, prisma/seed.ts
│   └── src/
│       ├── server.ts        # bootstrap: express + agenda o job repetível BullMQ
│       ├── app.ts            # express app, middlewares, mount de rotas
│       ├── config/           # env, prisma client, redis client, jwt
│       ├── modules/auth|clients|contracts/  # controller+service+routes por módulo
│       ├── jobs/              # queue.ts, worker.ts, expireContracts.ts
│       ├── middleware/        # authenticate.ts, errorHandler.ts
│       └── lib/cache.ts       # helpers Redis get/set/invalidate
└── frontend/
    └── src/
        ├── api/                # http client (axios) com interceptor JWT
        ├── auth/                # AuthContext, ProtectedRoute, LoginPage
        ├── pages/               # ClientsPage, ContractsPage, ContractFormPage
        └── components/          # StatusBadge, SummaryCards, Navbar
```

## 5. Modelo de dados

- `User { id, email, passwordHash }` — só o usuário seedado, sem tela de cadastro.
- `Client { id, name, document (unique), createdAt }`.
- `Contract { id, number (unique), clientId → Client, value (Decimal),
  dueDate (Date), status (enum: ATIVO | VENCIDO | ENCERRADO, default ATIVO),
  createdAt, updatedAt }`.

## 6. Regras de negócio críticas

- **Cálculo de "Vencido"**: nunca é escolhido manualmente — é sempre derivado de
  `dueDate < now()` enquanto o status ainda for `ATIVO`. Dois mecanismos, ambos
  devem existir (o enunciado permite escolher um, mas implementamos os dois
  porque são baratos e cobrem o requisito com folga):
  1. Job **periódico** BullMQ (`repeat: { every: 60_000 }`, agendado no boot do
     `server.ts`) — roda a cada 1 min (curto de propósito, para ficar visível
     em demo/avaliação sem esperar horas).
  2. **Lazy check** dentro do `GET /contracts` — antes de responder, atualiza
     no banco quaisquer `ATIVO` vencidos para `VENCIDO`.
- **"Encerrado" é definitivo**: uma vez `ENCERRADO`, o job/lazy-check nunca
  mais tocam o registro, mesmo que `dueDate` já tenha passado. Só uma edição
  manual do usuário poderia mudar isso (não há endpoint para "reabrir" —
  fora de escopo).
- **Cache Redis**: `GET /contracts` e `GET /contracts/summary` são cacheados
  (TTL curto, ~30s). Toda mutação (`POST/PUT/DELETE/PATCH` em contracts) e o
  job de vencimento invalidam essas duas chaves.

## 7. Convenções de código

- TypeScript estrito nos dois projetos (`strict: true`).
- Nomes de domínio (Cliente/Contrato/Vencimento) podem aparecer em português em
  UI/labels; identificadores de código (variáveis, funções, tabelas) em inglês.
- Sem comentários explicando o óbvio; comentar só decisões não-óbvias (ex.: por
  que o job roda a cada 1 min).
- Sem abstrações prematuras — é um desafio de 1 dia, não uma plataforma.

## 8. Comandos

```bash
# infra
docker compose up -d              # Postgres (5432) + Redis (6379)

# backend
cd backend && npm install
npx prisma migrate dev            # cria schema
npm run seed                      # cria usuário admin
npm run dev                       # http://localhost:3333

# frontend
cd frontend && npm install
npm run dev                       # http://localhost:5173
```

## 9. Lembretes finais (não esquecer)

- README precisa da seção "Uso de IA" — descrever honestamente que o projeto
  foi construído com Claude Code, incluindo este `CLAUDE.md` e a skill de
  verificação como parte do processo.
- Commits organizados por etapa fazem parte da entrega — não é um "extra",
  é requisito explícito do enunciado.
- Ambiente de desenvolvimento atual não tem Docker instalado — validar
  `docker-compose.yml` por leitura cuidadosa e documentar claramente no README
  que o fluxo completo (Postgres/Redis reais) deve ser testado pelo avaliador
  a partir do zero.
