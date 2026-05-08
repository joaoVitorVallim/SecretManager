<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Secret Manager

API para registrar, consultar e rotacionar secrets. Baseado em NestJS + TypeORM + Postgres.

## Requisitos

- Node.js 18+
- Postgres 13+

## Configuracao

Crie um arquivo `.env` com as variaveis abaixo:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=secret_manager
```

## Como rodar

```bash
npm install
npm run start:dev
```

Swagger: `http://localhost:3000/docs`

## Endpoints

Base URL: `/secrets`

### POST /register

Registra um secret. Retorna erro se ja existir cadastro ativo para o mesmo `reference_row`.

```json
{
  "reference_row": "API:bling:123,456",
  "credentials": {
    "client_cert": "----BEGIN CERTIFICATE----\n...\n----END CERTIFICATE----",
    "client_key": "----BEGIN PRIVATE KEY----\n...\n----END PRIVATE KEY----",
    "username": "napp154878",
    "password": "154878"
  },
  "expires_at": "2026-12-31T23:59:59.000Z"
}
```

### POST /rotate

Inativa o cadastro ativo e cria outro no lugar (mesmo `reference_row`).

Payload igual ao `/register`.

### GET /row

Busca secret ativo por `reference_row`, montado a partir dos parametros:

```
/secrets/row?type=API&system=bling&identifiers=123,456
```

### GET /hash/:hash

Busca secret ativo pelo `reference_hash`.

### GET /id/:id

Busca secret por id (independente de estar ativo).

### DELETE /row

Inativa secret por `reference_row`.

```
/secrets/row?type=API&system=bling&identifiers=123,456
```

### DELETE /hash/:hash

Inativa secret por `reference_hash`.

### DELETE /id/:id

Inativa secret por id.

## Observacoes

- O `reference_hash` e calculado como HASH do `reference_row`.
- Campos extras no body sao aceitos e ignorados pela validacao.
- Em desenvolvimento o TypeORM usa `synchronize: true`.
