# app-shell-starter

Casca genérica de aplicação **Angular** para criar qualquer SaaS ou painel a partir dela.
Já vem com app shell (sidebar + topbar + área de conteúdo), tema por tokens CSS, login, guards,
interceptors, contexto de tenant/usuário, menu por perfil e componentes de UI reutilizáveis.
**Nenhuma regra de negócio**: ela é só o esqueleto.

- **Frontend:** Angular (standalone, signals, novo control flow) + CSS puro
- **Backend esperado:** Java + Spring Boot
- **Base visual:** layout e paleta do `saas-monitor`

---

## Sumário

1. [Pré-requisitos](#1-pré-requisitos)
2. [Baixar a base](#2-baixar-a-base)
3. [Criar um projeto novo a partir da base](#3-criar-um-projeto-novo-a-partir-da-base)
4. [Rodar e gerar o build](#4-rodar-e-gerar-o-build)
5. [Construir algo em cima da base (passo a passo)](#5-construir-algo-em-cima-da-base-passo-a-passo)
6. [Conectar ao backend Spring Boot](#6-conectar-ao-backend-spring-boot)
7. [Publicar o seu projeto no GitHub](#7-publicar-o-seu-projeto-no-github)
8. [Onde mexer (referência rápida)](#8-onde-mexer-referência-rápida)
9. [Componentes disponíveis](#9-componentes-disponíveis)
10. [Problemas comuns](#10-problemas-comuns)

---

## 1. Pré-requisitos

| Ferramenta | Versão                                  | Para quê                      |
|------------|-----------------------------------------|-------------------------------|
| Node.js    | **22.22.3+** ou 24.15+ (exigência do Angular CLI atual) | rodar o Angular e o gerador |
| npm        | 10+ (vem com o Node)                    | instalar dependências         |
| Git        | qualquer versão recente                 | clonar e versionar            |
| GitHub CLI (`gh`) | opcional                         | criar o repositório pelo terminal |

Conferir: `node -v && npm -v && git --version`

---

## 2. Baixar a base

Escolha **uma** das opções.

**Opção A: clonar (recomendado)**

```bash
git clone https://github.com/<seu-usuario>/app-shell-starter.git
cd app-shell-starter
npm install
```

**Opção B: "Use this template" no GitHub**
No repositório, clique em **Use this template → Create a new repository** (precisa estar marcado como
template: `gh repo edit --template` ou *Settings → Template repository*). Depois clone o repositório novo.

**Opção C: arquivo `.zip`**

```bash
unzip app-shell-starter.zip
cd app-shell-starter
npm install
```

---

## 3. Criar um projeto novo a partir da base

Não trabalhe direto dentro do `app-shell-starter`: ele é o **molde**. Para cada aplicação nova, gere
uma cópia pelo gerador (dentro da pasta `app-shell-starter`):

```bash
node scripts/new-app.mjs ../meu-projeto \
  --name "Meu Projeto" --tenant minha-empresa --theme mint --install --git
```

O gerador copia a casca, troca nome, tenant, tema e título da aba, ajusta `package.json` e
`angular.json`, cria um README próprio, e (com as flags) instala as dependências e faz o commit inicial.

| Opção        | Exemplo                       | O que faz                                              |
|--------------|-------------------------------|--------------------------------------------------------|
| `<pasta>`    | `../meu-projeto`              | pasta de destino (obrigatória; não pode ter conteúdo)  |
| `--name`     | `"Sentinel IAM"`              | nome exibido na sidebar, no login e na aba             |
| `--slug`     | `sentinel-iam`                | nome técnico (padrão: derivado do `--name`)            |
| `--tenant`   | `contoso-br`                  | tenant mostrado na sidebar (`''` oculta)               |
| `--tagline`  | `"Gestão de acessos"`         | frase curta no login e no rodapé                       |
| `--theme`    | `default` ou `mint`           | tema definido em `src/styles/tokens.css`               |
| `--accent`   | `"#10b981"`                   | cor de destaque customizada (sobrescreve o tema)       |
| `--install`  |                               | roda `npm install` no projeto gerado                   |
| `--git`      |                               | roda `git init` + commit inicial                       |
| `--yes`      |                               | não pergunta nada; usa os argumentos/defaults          |

Sem argumentos o script **pergunta** o que faltar: `node scripts/new-app.mjs`.
Lista completa: `node scripts/new-app.mjs --help`.

---

## 4. Rodar e gerar o build

No projeto gerado (ou na própria base, para testar):

```bash
npm install          # só na primeira vez
npm start            # http://localhost:4200
npm run build        # build de produção em dist/<slug>/browser
```

Login do **modo demonstração** (funciona sem backend):

| E-mail               | Senha         | Perfil        |
|----------------------|---------------|---------------|
| `admin@app.local`    | `admin123`    | ADMIN         |
| `operador@app.local` | `operador123` | OPERADOR      |
| `leitor@app.local`   | `leitor123`   | VISUALIZADOR  |

Entre com cada um para ver o menu mudar conforme o perfil.

O conteúdo de `dist/<slug>/browser` é estático: pode ser servido por Nginx, Caddy, Apache ou
embutido em `src/main/resources/static` de um projeto Spring Boot. Como o Angular usa rotas
no navegador, configure o servidor para devolver `index.html` em qualquer rota desconhecida
(Nginx: `try_files $uri $uri/ /index.html;`).

---

## 5. Construir algo em cima da base (passo a passo)

Exemplo: um módulo **Clientes**, com listagem vinda da API e acesso só para ADMIN e OPERADOR.
Cada tela nova segue sempre as mesmas **3 etapas**: componente, rota, item de menu.

### Passo 1: o service (fala com o Spring Boot)

`src/app/features/clientes/clientes.service.ts`

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { shellConfig } from '../../core/config/shell.config';

// use "type" (e não "interface") para a tabela genérica aceitar o tipo
export type Cliente = {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
};

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<Cliente[]>(`${shellConfig.api.baseUrl}/clientes`);
  }
}
```

### Passo 2: a página

`src/app/features/clientes/clientes.component.ts`

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CellDefDirective, DataTableComponent, TableColumn } from '../../shared/ui/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';
import { Cliente, ClientesService } from './clientes.service';

@Component({
  selector: 'app-clientes',
  imports: [PageHeaderComponent, DataTableComponent, CellDefDirective, StatusBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header eyebrow="Cadastros" title="Clientes" subtitle="Lista vinda da API Spring Boot." />

    <app-data-table [columns]="columns" [rows]="clientes()">
      <ng-template appCell="ativo" let-row>
        <app-status-badge [tone]="row.ativo ? 'success' : 'neutral'">{{ row.ativo ? 'Ativo' : 'Inativo' }}</app-status-badge>
      </ng-template>
    </app-data-table>
  `,
})
export class ClientesComponent {
  private readonly service = inject(ClientesService);

  protected readonly columns: TableColumn[] = [
    { key: 'nome', label: 'Nome' },
    { key: 'email', label: 'E-mail' },
    { key: 'ativo', label: 'Status' },
  ];

  protected readonly clientes = toSignal(this.service.listar(), { initialValue: [] as Cliente[] });
}
```

### Passo 3: rota e menu

Em `src/app/app.routes.ts`, **antes** da rota `'**'`, e lembrando de importar o `roleGuard`
(`import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';`):

```ts
{
  path: 'clientes',
  canActivate: [roleGuard],
  data: { roles: ['ADMIN', 'OPERADOR'] },
  loadComponent: () => import('./features/clientes/clientes.component').then((m) => m.ClientesComponent),
},
```

Em `src/app/core/navigation/nav.config.ts`, troque o item "Cadastros" (que vem como "Em breve") por:

```ts
{ label: 'Clientes', path: '/clientes', icon: 'users', roles: ['ADMIN', 'OPERADOR'] },
```

Pronto: o item aparece no menu só para quem tem permissão, e a rota fica protegida pelo guard.
Sem backend ainda? Troque `this.service.listar()` por `of([...dados fixos...])` para desenhar a tela primeiro.

> O menu **esconde** e o guard **bloqueia**, mas a regra de verdade tem que existir no backend
> (Spring Security). Nunca confie só no front para permissões.

### Outras personalizações comuns

- **Mudar nome, tenant, tema, API:** `src/app/core/config/shell.config.ts`
- **Mudar cores/fontes:** `src/styles/tokens.css`
- **Criar um tema:** copie o bloco `:root[data-theme='mint']` em `tokens.css`, renomeie, ajuste as
  cores e use o nome em `shellConfig.theme`.
- **Novo ícone:** adicione o `path` em `ICONS` (`src/app/shared/ui/icon/icon.component.ts`).
- **Contador no menu:** `{ ..., badge: 5 }` no item do `nav.config.ts`.
- **Desligar o rodapé:** `footerEnabled: false` em `shell.config.ts`.

---

## 6. Conectar ao backend Spring Boot

1. Em `src/app/core/config/shell.config.ts`, troque `useMock: true` por `useMock: false`.
2. Suba a API em `http://localhost:8080`. O `proxy.conf.json` encaminha `/api/**` para ela
   **removendo o prefixo `/api`** (então `/api/auth/login` chega ao Spring como `/auth/login`),
   o que evita configurar CORS em desenvolvimento.
3. O backend precisa expor:

| Método | Rota (no Spring) | Corpo / Resposta                                    |
|--------|------------------|-----------------------------------------------------|
| POST   | `/auth/login`    | `{ email, password }` → `{ token }`                 |
| GET    | `/auth/me`       | → `{ id, name, email, role, tenant }`               |

`role` deve ser `ADMIN`, `OPERADOR` ou `VISUALIZADOR`. Toda chamada a `/api/**` já sai com
`Authorization: Bearer <token>`. Erros `401` encerram a sessão e mandam para o login;
falhas de rede e `5xx` viram um toast automaticamente.

Em **produção**, sirva o front e a API sob o mesmo domínio (ex.: Nginx com `/` para o Angular e
`/api` para o Spring) ou ajuste `api.baseUrl` e configure CORS no Spring Security.

---

## 7. Publicar o seu projeto no GitHub

Para cada projeto gerado (e também para o próprio `app-shell-starter`, se ainda não estiver no GitHub):

```bash
cd ../meu-projeto
gh repo create meu-projeto --private --source . --push
```

Sem o `gh`: crie o repositório vazio em github.com e rode

```bash
git remote add origin https://github.com/<seu-usuario>/meu-projeto.git
git branch -M main
git push -u origin main
```

Se o projeto foi gerado sem `--git`, rode antes `git init && git add -A && git commit -m "feat: projeto inicial"`.

Para transformar o `app-shell-starter` em **template** do GitHub (botão "Use this template"):

```bash
gh repo edit --template
```

---

## 8. Onde mexer (referência rápida)

| O quê                     | Arquivo                                       |
|---------------------------|-----------------------------------------------|
| Nome, tenant, tema, API   | `src/app/core/config/shell.config.ts`         |
| Menu e permissões         | `src/app/core/navigation/nav.config.ts`       |
| Rotas / telas             | `src/app/app.routes.ts` + `src/app/features/` |
| Cores, fontes, temas      | `src/styles/tokens.css`                       |
| Layout do shell           | `src/app/core/layout/app-shell/` + `src/styles/shell.css` |
| Componentes reutilizáveis | `src/app/shared/ui/`                          |
| Proxy de desenvolvimento  | `proxy.conf.json`                             |

Estrutura e decisões em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

---

## 9. Componentes disponíveis

Todos standalone, em `src/app/shared/ui/`:

| Componente       | Uso                                                                              |
|------------------|----------------------------------------------------------------------------------|
| `app-page-header`| `<app-page-header eyebrow="…" title="…" subtitle="…"> botões </app-page-header>` |
| `app-kpi-card`   | `<app-kpi-card label="Ativos" [value]="4812" icon="activity" trend="+3,2%" tone="success" />` |
| `app-status-badge`| `<app-status-badge tone="success">Provisionado</app-status-badge>` (tons: neutral, success, danger, warning, info, purple, accent) |
| `app-data-table` | colunas + linhas; célula customizada com `<ng-template appCell="chave" let-row>` |
| `app-countdown`  | `<app-countdown [until]="expiraEm" (expired)="recarregar()" />` contador HH:MM:SS |
| `app-empty-state`| estado vazio de listas                                                           |
| `app-icon`       | `<app-icon name="shield" [size]="18" />`                                         |
| `ToastService`   | `inject(ToastService).success('Salvo')` / `.error('Falhou')`                     |

A tela `src/app/features/dashboard/` mostra todos eles em uso.

---

## 10. Problemas comuns

| Sintoma                                              | Causa / solução                                                            |
|------------------------------------------------------|----------------------------------------------------------------------------|
| `The Angular CLI requires a minimum Node.js version` | Atualize o Node para 22.22.3+ ou 24.15+                                    |
| `Inlining of fonts failed ... 403` no build           | Já desativado na base (`fonts.inline: false`). Se voltar, confira o `angular.json` |
| Erro de tipo ao passar lista para `app-data-table`   | Use `type Algo = {...}` em vez de `interface` no DTO                       |
| Tela em branco após `F5` em produção                 | Servidor precisa devolver `index.html` nas rotas desconhecidas (seção 4)   |
| `401` logo após login com backend                    | Confira o formato de `/auth/login` e `/auth/me` (seção 6)                  |
| Mudei o menu e nada apareceu                         | Item com `roles` só aparece para esses perfis; teste com o usuário ADMIN   |
