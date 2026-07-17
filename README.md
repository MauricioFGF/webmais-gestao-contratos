# 📜 Gestão de Contratos

Módulo simplificado de Gestão de Contratos: cadastro de clientes e contratos com
controle de status (**Ativo / Vencido / Encerrado**), desenvolvido como desafio
técnico para a WebMais.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + TypeScript + Express |
| ORM | Prisma |
| Banco | PostgreSQL 15 |
| Cache | Redis 7 |
| Jobs assíncronos | BullMQ |
| Autenticação | JWT |
| Frontend | React 19 + Vite + TypeScript |

## Como rodar

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose

### 1. Subir a infraestrutura (Postgres + Redis)

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev    # cria as tabelas
npm run seed              # cria o usuário de login
npm run dev               # API em http://localhost:3333
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

### 4. Login

| Campo | Valor |
|---|---|
| E-mail | `admin@webmais.com` |
| Senha | `admin123` |

## Funcionalidades

- **Login/Logoff** com JWT (expiração de 8h); rotas protegidas no front e no back.
- **Clientes**: cadastro (nome + documento único) e listagem.
- **Contratos**: CRUD completo (número único, cliente, valor, vencimento),
  vinculado a um cliente.
- **Encerramento manual** de contrato, com feedback visual (badge muda, linha
  destacada e toast de confirmação). Encerrado é definitivo — o job de
  vencimento nunca reabre/altera um contrato encerrado.
- **Resumo por status**: cards com contagem de Ativos / Vencidos / Encerrados.
- **Vencimento automático**: contratos `ATIVO` com data de vencimento no
  passado viram `VENCIDO` por dois mecanismos:
  1. **Job periódico BullMQ** (fila `contract-expiration`, repetição a cada
     1 min — intervalo curto de propósito, para o comportamento ser visível
     durante a avaliação);
  2. **Verificação na consulta** (`GET /contracts` e `GET /contracts/summary`
     atualizam vencidos antes de responder).
- **Cache Redis**: listagem de contratos e resumo por status são cacheados
  (TTL 30s); qualquer mutação de contrato (criar/editar/excluir/encerrar) e o
  job de vencimento invalidam o cache.

## API

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/login` | Login, retorna JWT | — |
| GET | `/clients` | Lista clientes | ✔ |
| POST | `/clients` | Cadastra cliente | ✔ |
| GET | `/contracts` | Lista contratos (cache Redis) | ✔ |
| GET | `/contracts/summary` | Contagem por status (cache Redis) | ✔ |
| GET | `/contracts/:id` | Detalhe de contrato | ✔ |
| POST | `/contracts` | Cadastra contrato | ✔ |
| PUT | `/contracts/:id` | Edita contrato | ✔ |
| PATCH | `/contracts/:id/encerrar` | Encerra contrato manualmente | ✔ |
| DELETE | `/contracts/:id` | Exclui contrato | ✔ |

O logoff é client-side (descarte do token JWT), como é padrão em auth stateless.

## Estrutura

```
├── docker-compose.yml    # Postgres + Redis
├── backend/
│   ├── prisma/           # schema + seed
│   └── src/
│       ├── modules/      # auth, clients, contracts
│       ├── jobs/         # fila e worker BullMQ
│       ├── lib/cache.ts  # helpers de cache Redis
│       └── middleware/   # JWT, tratamento de erros
└── frontend/
    └── src/
        ├── api/          # axios + serviços tipados
        ├── auth/         # contexto, rota protegida, login
        ├── pages/        # clientes, contratos, form
        └── components/   # badge, cards de resumo, navbar, toast
```

## Uso de ferramentas de IA

Este projeto foi desenvolvido com o auxílio do **Claude Code** (Anthropic),
usado como par de programação durante todo o desenvolvimento:

- Antes de codificar, foi criada uma documentação de contexto (`CLAUDE.md`) com
  o checklist completo dos requisitos do desafio, decisões de arquitetura e
  regras de negócio, além de uma skill de verificação
  (`.claude/skills/verify-requirements/`) usada ao final para conferir item a
  item do enunciado contra o código real.
- O código do backend e do frontend foi gerado pelo Claude Code sob minha
  direção (escolhas de stack, ORM, estratégia de cache e de vencimento
  automático foram decisões revisadas por mim), com typecheck e build
  executados a cada etapa.
- Os commits foram organizados por etapa lógica durante o próprio
  desenvolvimento assistido.
