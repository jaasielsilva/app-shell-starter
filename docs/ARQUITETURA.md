# Arquitetura — app-shell-starter

Referência para quem desenvolve a partir da casca. Siga este padrão em todos os módulos.

## Identificação

| Campo   | Valor                                                       |
|---------|-------------------------------------------------------------|
| Nome    | app-shell-starter                                           |
| Tipo    | Frontend base (SPA) para SaaS / painéis internos            |
| Stack   | Angular (standalone, signals, novo control flow), CSS puro  |
| Backend | Java + Spring Boot (contrato em `README.md`)                |
| Origem  | Layout e paleta do `saas-monitor`                           |

**Fora de escopo da casca:** regras de negócio, módulos de domínio, i18n, testes e2e.

## Estrutura

```
src/
├── styles/                    tokens.css (tema) · base.css · shell.css · ui.css
└── app/
    ├── app.ts / app.config.ts / app.routes.ts
    ├── core/                  só o que é transversal; nada de domínio aqui
    │   ├── config/            shell.config.ts  → identidade e API da aplicação
    │   ├── navigation/        nav.config.ts    → menu por perfil
    │   ├── layout/app-shell/  sidebar + topbar mobile + router-outlet
    │   ├── guards/            authGuard · guestGuard · roleGuard
    │   ├── interceptors/      auth (JWT) · error (401, rede, 5xx)
    │   ├── services/          auth · tenant-context · toast
    │   ├── auth/              token.storage · mock-auth (modo demonstração)
    │   └── models/            user.model.ts
    ├── shared/ui/             componentes sem regra de negócio
    │                          icon · page-header · kpi-card · status-badge ·
    │                          data-table · empty-state · countdown · toast
    └── features/              um diretório por módulo de negócio
        ├── auth/login/
        ├── dashboard/         exemplo de composição de página
        └── not-found/
```

### Padrão por feature

```
features/<modulo>/
├── <modulo>.component.ts|html   página (standalone, OnPush)
├── <modulo>.service.ts          HttpClient → API; devolve DTOs tipados
└── models/                      interfaces dos DTOs (espelham o backend)
```

## Decisões

1. **Config em um lugar só.** Identidade (`shell.config.ts`) e menu (`nav.config.ts`) são os dois
   arquivos que mudam entre aplicações; o gerador `scripts/new-app.mjs` os reescreve.
2. **Tema por variáveis CSS.** Nenhum componente tem cor fixa; tudo vem de `tokens.css`.
   Trocar tema = trocar `data-theme` (aplicado em `app.ts`).
3. **Estilos globais por área** (`shell.css`, `ui.css`) em vez de estilos por componente,
   para o tema ser transparente e o gerador poder customizar sem tocar componentes.
4. **Autenticação por JWT** em `localStorage` (simples para começar). Para dados sensíveis,
   migrar para cookie HttpOnly emitido pelo Spring Security.
5. **Sessão restaurada na inicialização** (`provideAppInitializer` → `GET /auth/me`), então
   guards e menu já nascem com o perfil correto.
6. **Menu filtrado por perfil**, e rotas protegidas por `roleGuard`: o menu esconde, o guard bloqueia.
   As permissões reais continuam sendo validadas no backend.
7. **Itens futuros** aparecem com `disabled: true` e etiqueta "Em breve".

## Convenções

- Componentes standalone com `ChangeDetectionStrategy.OnPush`; estado local com `signal`/`computed`.
- `inject()` em vez de construtor para dependências.
- Template com `@if` / `@for` (sempre com `track`).
- Nada de `any`; DTOs tipados.
- Páginas lazy-loaded via `loadComponent`.

## Estado atual

| Área                         | Status |
|------------------------------|--------|
| Shell, tema, login, guards   | ✅     |
| Componentes de UI base       | ✅     |
| Modo demonstração (mock)     | ✅     |
| Backend base Spring Boot     | 🔲     |
| Testes unitários             | 🔲     |
| CI (GitHub Actions)          | 🔲     |
| Biblioteca npm do shell      | 🔲 (extrair quando houver 3+ apps) |
