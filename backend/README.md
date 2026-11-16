# Scheduling API

API Java 21 / Spring Boot 4 para solicitações de agendamento. Usa PostgreSQL, Flyway e autenticação administrativa por sessão HTTP. As migrations `V1`, `V2` e `V3` são aplicadas automaticamente no startup; não use `ddl-auto=update` nem `flyway clean`.

## Executar localmente

Defina as variáveis abaixo e execute `mvnw.cmd spring-boot:run` no Windows (ou `./mvnw spring-boot:run`):

```text
DB_URL=jdbc:postgresql://localhost:5432/scheduling_db
DB_USER=...
DB_PASSWORD=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

`ADMIN_USERNAME` e `ADMIN_PASSWORD` são consumidas apenas para criar a primeira conta quando `admin_accounts` ainda está vazia. A senha é convertida em hash BCrypt antes de ser persistida e nunca deve ser incluída em arquivos versionados. Depois do primeiro provisionamento, remova `ADMIN_PASSWORD` do ambiente de execução. Sem uma conta provisionada, os endpoints administrativos continuam inacessíveis.

## Autenticação administrativa

O sistema usa sessão HTTP no cookie `SCHEDULING_SESSION` (HttpOnly, oito horas). Em produção, o cookie é `Secure` por padrão e exige HTTPS. Para desenvolvimento HTTP local, defina explicitamente `APP_SESSION_COOKIE_SECURE=false`; não use esse valor em produção.

| Método e rota | Uso |
| --- | --- |
| `GET /api/auth/csrf` | Emite o cookie legível `XSRF-TOKEN` e retorna o token/header a enviar. |
| `POST /api/auth/login` | Recebe `{ "username", "password" }`, com CSRF válido; cria a sessão. |
| `GET /api/auth/me` | Retorna `{ "authenticated", "username" }`, sem dados sensíveis. |
| `POST /api/auth/logout` | Requer sessão e CSRF; invalida a sessão. |

Não existe registro público de administradores. Há limitação em memória de cinco falhas de login por usuário/endereço IP durante 15 minutos, configurável por `APP_LOGIN_MAX_ATTEMPTS`.

Todos os endpoints administrativos exigem o papel interno `ADMIN`:

- `/api/services/**`
- `/api/admin/appointments/**`
- `/api/admin/schedule/**`

As rotas públicas continuam anônimas:

- `GET /api/public/services`
- `GET /api/public/availability?date=YYYY-MM-DD&serviceId=id`
- `POST /api/public/appointments`
- `GET /api/health`

## React, cookies e CSRF

Para cada sessão do painel, o frontend deve primeiro chamar `GET /api/auth/csrf` com `credentials: 'include'`. Nas chamadas `POST`, `PUT`, `PATCH` e `DELETE` autenticadas, deve enviar `credentials: 'include'` e o valor do cookie `XSRF-TOKEN` no header retornado (normalmente `X-XSRF-TOKEN`). Exemplo:

```ts
await fetch(`${apiUrl}/api/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfToken },
  body: JSON.stringify({ username, password }),
})
```

Quando React e API estiverem em origens distintas, configure uma lista explícita e sem curingas em `APP_CORS_ALLOWED_ORIGINS`, por exemplo `https://agenda.exemplo.com`. CORS permite credenciais somente para essas origens. Para hospedagem realmente cross-site, configure `APP_SESSION_COOKIE_SAME_SITE=None` **junto com** HTTPS e `APP_SESSION_COOKIE_SECURE=true`; prefira hospedar frontend e API no mesmo site quando possível. O proxy reverso deve encaminhar HTTPS corretamente.

## Regras de agendamento

As janelas de atendimento não são preenchidas automaticamente. Configure-as antes de liberar agendamentos públicos. A disponibilidade usa `America/Recife`, incrementos de 15 minutos, duração do serviço, bloqueios e reservas pendentes/confirmadas. A constraint PostgreSQL `appointments_no_active_overlap` é a garantia final contra reservas concorrentes.

## Testes

`mvnw.cmd test` usa Testcontainers com PostgreSQL 16 isolado; não usa `DB_URL`, credenciais do banco local ou `flyway clean`. Docker Desktop deve estar disponível. A suíte cobre migrations, conflitos, cancelamento, confirmação, remarcação, concorrência, login, CSRF, sessão, logout, hash BCrypt e proteção das rotas administrativas.

Para Docker Engine 29, o Surefire força a API Docker `1.44`, evitando uma negociação legada incompatível com o Npipe do Docker Desktop.

## Desenvolvimento com o frontend React

Inicie a API em `http://localhost:8080` e o Vite em `frontend` com `npm run dev`. O proxy do Vite encaminha `/api` para a API, preservando uma origem única no navegador e evitando CORS durante o desenvolvimento. Como o ambiente local usa HTTP, inicie o backend com `APP_SESSION_COOKIE_SECURE=false`; mantenha o padrão seguro (`true`) em produção.

O painel em `/admin` encaminha para `/admin/login` sem sessão. O frontend não guarda senha, token CSRF ou cookie de sessão em `localStorage`; ele usa o cookie HttpOnly emitido pelo backend e busca um token CSRF novo antes de cada alteração administrativa.
