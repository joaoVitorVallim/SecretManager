# Secret Manager API

API para registrar, consultar e rotacionar secrets. Stack: NestJS + TypeORM + Postgres.

## Visao geral

- Autenticacao via API token (Bearer)
- `reference_hash` e SHA256 de `TYPE:SYSTEM:IDENTIFIERS`
- `credentials` sao criptografadas com AES-256-GCM

## Requisitos

- Node.js 18+
- Postgres 13+ (local) ou Docker

## Autenticacao

Todos os endpoints exigem o header:

```
Authorization: Bearer <API_TOKEN>
```

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

Variaveis usadas pela API:

- `PORT`: porta da API (hoje a aplicacao escuta 3000 fixo)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- `API_TOKEN`: token esperado no header `Authorization`
- `SECRET_ENCRYPTION_KEY`: 32 bytes hex (64 chars). Exemplo: `openssl rand -hex 32`

Variaveis usadas pelo Docker Compose:

- `DB_HOST_DOCKER`: host do banco visto pelo container da API
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`: usados no container do Postgres

## Rodar localmente

```bash
cp .env.example .env
npm install
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
- DB: `localhost:5433` (Postgres interno em 5432)
- As migrations rodam no start do container da API

## Referencia da API

Base URL: `/secrets`

### POST `/secrets/register`

Registra um secret ativo novo. Retorna o secret com `credentials` descriptografadas.

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

Response 201:

```json
{
  "id": 1,
  "reference_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1",
  "type": "API",
  "system": "bling",
  "identifiers": ["123", "456"],
  "credentials": {
    "username": "napp154878",
    "password": "154878"
  },
  "is_active": true,
  "created_at": "2026-05-11T10:00:00.000Z",
  "deactivated_at": null,
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

### POST `/secrets/rotate`

Desativa o secret ativo atual e cria um novo. Body igual ao `/register`.

Response 201 (mesmo formato do `/register`).

### GET `/secrets`

Lista secrets com filtros opcionais.

Query params:

- `type`: filtra por tipo (substring case-insensitive)
- `system`: filtra por sistema (substring case-insensitive)
- `identifiers`: lista separada por virgula (ex: `123,456`)
- `active`: `true` ou `false`
- `page`: default `1`
- `limit`: default `20` (max `100`)

Exemplo:

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets?type=API&system=bling&identifiers=123,456&active=true&page=1&limit=20"
```

Response 200:

```json
{
  "data": [
    {
      "id": 1,
      "reference_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1",
      "type": "API",
      "system": "bling",
      "identifiers": ["123", "456"],
      "credentials": {
        "username": "napp154878",
        "password": "154878"
      },
      "is_active": true,
      "created_at": "2026-05-11T10:00:00.000Z",
      "deactivated_at": null,
      "expires_at": "2026-12-31T23:59:59.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

### GET `/secrets/by-row`

Busca o secret ativo por `type`, `system` e `identifiers` (query). Retorna `credentials` descriptografadas.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-row?type=API&system=bling&identifiers=123,456"
```

Response 200 (mesmo formato do `/register`).

### GET `/secrets/by-hash/:hash`

Busca o secret ativo por `reference_hash`. Retorna `credentials` descriptografadas.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-hash/5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1"
```

Response 200 (mesmo formato do `/register`).

### GET `/secrets/by-id/:id`

Busca o secret por id. Atencao: esta rota retorna `credentials` no formato criptografado.

```bash
curl -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-id/1"
```

Response 200:

```json
{
  "id": 1,
  "reference_hash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1",
  "type": "API",
  "system": "bling",
  "identifiers": ["123", "456"],
  "credentials": {
    "iv": "0a5f93d18f7a9c8b2d3e4f5a",
    "tag": "bb2c4d5e6f7a8899aabbccdd",
    "_enc": "e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a"
  },
  "is_active": true,
  "created_at": "2026-05-11T10:00:00.000Z",
  "deactivated_at": null,
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

### PATCH `/secrets/by-row/:type/:system/:identifiers/deactivate`

Desativa o secret atual para a row informada. `identifiers` deve ser uma lista separada por virgula (ex: `123,456`).

```bash
curl -X PATCH -H "Authorization: Bearer <API_TOKEN>" \
  "http://localhost:3000/secrets/by-row/API/bling/123,456/deactivate"
```

Response 200:

```json
{
  "message": "Secret API:bling:123:456 deactivated"
}
```

### PATCH `/secrets/by-hash/:hash/deactivate`

Desativa o secret atual por hash. Response 200 no mesmo formato do exemplo acima.

### PATCH `/secrets/by-id/:id/deactivate`

Desativa o secret por id. Response 200 no mesmo formato do exemplo acima.

## Observacoes

- `type`, `system` e `identifiers` sao normalizados (trim)
- `reference_hash` e SHA256 do formato `TYPE:SYSTEM:IDENTIFIERS` (identifiers unidos por `:`)
- `credentials` sao criptografadas com AES-256-GCM usando `SECRET_ENCRYPTION_KEY`
- Rotas de leitura ativas retornam `credentials` descriptografadas; `/by-id` retorna o payload criptografado
- `identifiers` em query/path aceitam lista separada por virgula
- `expires_at` aceita data (`YYYY-MM-DD`) ou data/hora ISO 8601
