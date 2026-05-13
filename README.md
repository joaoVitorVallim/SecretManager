# Secret Manager API

API para registrar, consultar e rotacionar secrets. Stack: NestJS + TypeORM + Postgres.

## Visao geral

- Autenticacao via API token (Bearer)
- `reference_hash` e SHA256 de `TYPE:SYSTEM:IDENTIFIERS`
- `credentials` sao criptografadas com AES-256-GCM

## Requisitos

- Node.js 18+
- Postgres 13+ (local) ou Docker
- Redis 7+ (local) ou Docker

## Autenticacao

Todos os endpoints em `/secrets` exigem o header:

```
Authorization: Bearer <API_TOKEN>
```

O endpoint `GET /` e publico (nao exige token) e retorna um banner de status.

Exemplo:

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-row?type=API&system=bling&identifiers=123,456"
```

## Variaveis de ambiente

Copie o arquivo `.env.example` para `.env` e ajuste os valores:

```bash
cp .env.example .env
```

### App

- `PORT`: porta configurada
- `API_TOKEN`: token esperado no header `Authorization`
- `SECRET_ENCRYPTION_KEY`: 32 bytes hex (64 chars). Exemplo: `openssl rand -hex 32`

### Banco (API)

- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`

### Docker Compose

- `DB_HOST_DOCKER`: host do banco visto pelo container da API (sobrescreve `DB_HOST`)
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: usados no container do Postgres

### Email

- `MAIL_HOST`, `MAIL_PORT` (default 587), `MAIL_USER`, `MAIL_PASS`, `MAIL_FROM`
- `MAIL_EXPIRY_ALERT_DAYS` (default 5)
- `MAIL_ALERT_RECIPIENTS`: lista separada por virgula

### Slack

- `SLACK_WEBHOOK_URL`

### Redis

- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_TTL`
- `REDIS_PASSWORD` e obrigatorio no `docker compose` (o container inicia com `--requirepass`)

## Rodar localmente

```bash
cp .env.example .env
npm install
# Opcional: subir apenas infra com docker compose
docker compose up db redis -d
npm run migration:run
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

## Rodar com Docker

```bash
cp .env.example .env
docker compose up --build
```

- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`
- DB: `localhost:5433` (Postgres interno em 5432)
- Redis: `localhost:6379` (usa `REDIS_PASSWORD`)
- As migrations rodam no start do container da API

## Referencia da API

Base URL: `/secrets`

Endpoints publicos:

- `GET /` (status em texto)
- `GET /docs` (Swagger UI)

### POST `/secrets/register`

Registra um secret ativo novo. Campos extras sao rejeitados.

Body:

```json
{
  "type": "API",
  "system": "bling",
  "identifiers": ["123", "456"],
  "credentials": {
    "username": "napp154878",
    "password": "154878"
  },
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

Response 201: secret ativo com `credentials` descriptografadas.

### POST `/secrets/rotate`

Desativa o secret ativo atual e cria um novo. Body igual ao `/register`.
Se nao houver secret ativo, retorna 404.

### GET `/secrets`

Lista secrets com filtros opcionais.

Query params:

- `type`: filtra por tipo (substring case-insensitive)
- `system`: filtra por sistema (substring case-insensitive)
- `identifiers`: lista separada por virgula (ex: `123,456`) e faz match por item
- `active`: `true` ou `false`
- `page`: default `1`
- `limit`: default `20` (max `100`)

Exemplo:

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets?type=API&system=bling&identifiers=123,456&active=true&page=1&limit=20"
```

### GET `/secrets/by-row`

Busca o secret ativo por `type`, `system` e `identifiers` (query). `identifiers` e uma lista separada por virgula.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-row?type=API&system=bling&identifiers=123,456"
```

### GET `/secrets/by-hash/:hash`

Busca o secret ativo por `reference_hash`.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-hash/5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1"
```

### GET `/secrets/by-id/:id`

Busca o secret ativo por id.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-id/1"
```

### PATCH `/secrets/by-row/:type/:system/:identifiers/deactivate`

Desativa o secret atual para a row informada. `identifiers` deve ser uma lista separada por virgula (ex: `123,456`).

```bash
curl -X PATCH -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-row/API/bling/123,456/deactivate"
```

### PATCH `/secrets/by-hash/:hash/deactivate`

Desativa o secret atual por hash. Response 200 no mesmo formato do exemplo acima.

### PATCH `/secrets/by-id/:id/deactivate`

Desativa o secret por id. Response 200 no mesmo formato do exemplo acima.

## Observacoes

- `type` e convertido para uppercase e `system` para lowercase
- `identifiers` sao normalizados (trim) e aceitam lista separada por virgula em query/path
- `reference_hash` e SHA256 do formato `TYPE:SYSTEM:IDENTIFIERS` (identifiers unidos por `:`)
- `credentials` sao criptografadas em repouso (AES-256-GCM) e retornam descriptografadas nas respostas
- `expires_at` aceita data (`YYYY-MM-DD`) ou data/hora ISO 8601; data sem hora vira `T00:00:00-03:00`
- `limit` maximo e 100
