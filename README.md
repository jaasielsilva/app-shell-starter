# app-shell-starter

Casca genérica de aplicação **Angular** para criar qualquer SaaS/painel a partir dela.
Já vem com: app shell (sidebar + topbar + outlet), tema por tokens CSS, login, guards,
interceptors, contexto de tenant/usuário, menu por perfil e componentes de UI reutilizáveis.
Nenhuma regra de negócio.

Base visual: paleta e layout do `saas-monitor`. Backend esperado: **Java + Spring Boot**.

## Criar um projeto novo a partir da casca

```bash
git clone <url-deste-repo> app-shell-starter
cd app-shell-starter
npm install            # só na primeira vez (o gerador usa apenas Node)

node scripts/new-app.mjs ../meu-projeto \
  --name "Meu Projeto" --tenant minha-empresa --theme mint --install --git
```

Sem argumentos o script pergunta nome, slug, tenant, tagline e tema.
Veja todas as opções com `node scripts/new-app.mjs --help`.

## Rodar a própria casca

```bash
npm install
npm start     # http://localhost:4200  (login demo: admin@app.local / admin123)
npm run build
```

Requer Node 22.22.3+ (ou 24.15+) por causa do Angular CLI atual.

## Como personalizar (o que muda em cada app)

| O quê                     | Arquivo                                      |
|---------------------------|----------------------------------------------|
| Nome, tenant, tema, API   | `src/app/core/config/shell.config.ts`        |
| Menu e permissões         | `src/app/core/navigation/nav.config.ts`      |
| Rotas / telas             | `src/app/app.routes.ts` + `src/app/features/`|
| Cores, fontes, temas      | `src/styles/tokens.css`                      |
| Componentes reutilizáveis | `src/app/shared/ui/`                         |

### Adicionar uma tela

1. Crie `src/app/features/<modulo>/<modulo>.component.ts` (standalone).
2. Adicione a rota filha em `app.routes.ts` (use `roleGuard` + `data.roles` para restringir por perfil).
3. Adicione o item em `NAV` (`nav.config.ts`).

### Criar um tema

Copie o bloco `:root[data-theme='mint']` em `tokens.css`, renomeie e ajuste as cores;
depois use o nome em `shellConfig.theme`.

## Integração com o backend

Com `api.useMock = false` o shell espera:

| Método | Rota          | Corpo / Resposta                                    |
|--------|---------------|-----------------------------------------------------|
| POST   | `/auth/login` | `{ email, password }` → `{ token }`                 |
| GET    | `/auth/me`    | → `{ id, name, email, role, tenant }`               |

`role` ∈ `ADMIN | OPERADOR | VISUALIZADOR`. As chamadas a `/api/**` recebem `Authorization: Bearer <token>`.
Em desenvolvimento, `proxy.conf.json` encaminha `/api` para `http://localhost:8080`
(removendo o prefixo `/api`). Ajuste o `baseUrl` se sua API não usar esse prefixo.

## Documentação

- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md): estrutura, convenções e decisões.
