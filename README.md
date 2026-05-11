# Secret Manager API

API para registrar, consultar e rotacionar secrets. Stack: NestJS + TypeORM + Postgres.

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
  "http://localhost:3000/secrets/row?type=API&system=bling&identifiers=123,456"
```

## Variaveis de ambiente

Crie um arquivo `.env` com as variaveis abaixo:

```bash
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=secret_manager

# docker-compose
DB_HOST_DOCKER=db
POSTGRES_DB=secret_manager
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

API_TOKEN=your-token-here
# 32 bytes hex (64 chars). Exemplo: openssl rand -hex 32
SECRET_ENCRYPTION_KEY=your-32-byte-hex-key
```

## Rodar localmente

```bash
npm install
npm run migration:run
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

## Rodar com Docker

```bash
docker compose up --build
```

- API: `http://localhost:3000`
- DB: `localhost:5433` (Postgres interno em 5432)
- As migrations rodam no start do container da API

## Endpoints

Base URL: `/secrets`

- POST `/register`
- POST `/rotate`
- GET `/row?type=API&system=bling&identifiers=123,456`
- GET `/hash/:hash`
- GET `/id/:id`
- DELETE `/row?type=API&system=bling&identifiers=123,456`
- DELETE `/hash/:hash`
- DELETE `/id/:id`

## Observacoes

- `type`, `system` e `identifiers` sao salvos separadamente
- `reference_hash` e SHA256 do formato `TYPE:SYSTEM:IDENTIFIERS` (identifiers unidos por `:`)
- `credentials` sao criptografados com AES-256-GCM usando `SECRET_ENCRYPTION_KEY`
- Rotas de consulta retornam `credentials` descriptografado
