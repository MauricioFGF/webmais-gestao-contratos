---
name: verify-requirements
description: Verifica o checklist completo do desafio WebMais (Gestão de Contratos) contra o estado real do código antes de reportar a tarefa como concluída. Use antes de finalizar qualquer sessão de trabalho neste repositório, ou quando o usuário perguntar "o que falta" / "está tudo pronto".
---

# Verificar requisitos do desafio WebMais

Percorra cada item do checklist em `CLAUDE.md` (seção 2) e, para cada um,
verifique no código real — não confie em memória de trabalho anterior.

## Como verificar cada item

1. **Login** — `frontend/src/auth/LoginPage.tsx` existe e chama
   `POST /auth/login`; `backend/src/modules/auth` valida contra usuário
   seedado em `prisma/seed.ts`.
2. **Cadastrar cliente** — `frontend/src/pages/ClientsPage.tsx` tem form
   nome+documento; `POST /clients` no backend persiste via Prisma.
3. **Listar contratos** — `ContractsPage.tsx` renderiza tabela com número,
   cliente, valor, vencimento, status; vem de `GET /contracts`.
4. **Cadastrar contrato** — form em `ContractFormPage.tsx` com `<select>` de
   clientes carregado de `GET /clients`; `POST /contracts`.
5. **Editar contrato** — mesma `ContractFormPage.tsx` em modo edição; `PUT
   /contracts/:id`.
6. **Excluir contrato** — botão na tabela; `DELETE /contracts/:id`; confirma
   se há um `window.confirm` ou modal antes (evitar exclusão acidental).
7. **Encerrar contrato + feedback visual** — botão "Encerrar" chama `PATCH
   /contracts/:id/encerrar`; confira que a UI mostra alguma mudança visível
   (badge muda de cor, toast, ou linha destacada) após a ação, não só um
   refetch silencioso.
8. **Resumo por status** — `SummaryCards.tsx` (ou equivalente) lê `GET
   /contracts/summary` e mostra 3 números (Ativos/Vencidos/Encerrados).
9. **Logoff** — botão em `Navbar.tsx` limpa token do `localStorage` e
   redireciona para `/login`. Confirme que rotas protegidas realmente
   bloqueiam acesso sem token (`ProtectedRoute.tsx`).
10. **API REST completa** — rode `grep` nas rotas do backend e confirme que
    cada ação do front acima tem endpoint correspondente.
11. **JWT** — middleware `authenticate.ts` aplicado em `clients` e
    `contracts` (não em `auth/login`).
12. **PostgreSQL + relação Contrato→Cliente** — `prisma/schema.prisma` tem
    `Contract.clientId` como FK de `Client`.
13. **Cache Redis** — `lib/cache.ts` usado em `GET /contracts` e/ou `GET
    /contracts/summary`, com invalidação nas mutações. Confirme a invalidação
    existe em CADA mutation handler (create/update/delete/encerrar) e no job.
14. **BullMQ** — `jobs/queue.ts` + `jobs/worker.ts` existem, job repetível
    agendado no `server.ts`, e/ou lazy-check em `GET /contracts`.
15. **Git organizado** — `git log --oneline` mostra commits separados por
    etapa lógica (não um único commit gigante).
16. **docker-compose.yml** — serviços `postgres` e `redis` com portas e
    volumes corretos.
17. **README** — tem seção de setup (docker, backend, frontend, credenciais
    seed) E uma seção explícita "Uso de IA" / "IA generativa" descrevendo o
    uso do Claude Code.

## Saída esperada

Reporte ao usuário uma lista curta, item por item do checklist de
`CLAUDE.md`, marcando cada um como:
- ✅ feito e verificado no código
- ⚠️ feito mas não testado ao vivo (ex.: sem Docker no ambiente de dev)
- ❌ pendente — e o que falta especificamente

Não marque nada como ✅ sem ter de fato lido o arquivo/trecho relevante nesta
verificação.
