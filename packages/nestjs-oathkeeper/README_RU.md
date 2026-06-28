# ATLS NestJS Oathkeeper

[![Oathkeeper Docs EN](https://img.shields.io/badge/Oathkeeper%20Docs-EN-1f8a70)](README.md)
[![Oathkeeper Docs RU](https://img.shields.io/badge/Oathkeeper%20Docs-RU-0b5fff)](README_RU.md)

## Что Это

`@atls/nestjs-oathkeeper` — NestJS-пакет для интеграции приложений с Ory Oathkeeper Access Control Decision API.

Пакет отвечает за подключение NestJS-модуля, типизированные decision-вызовы, преобразование Fastify request-контекста в Oathkeeper-заголовки и опциональное обогащение request заголовками, которые вернули Oathkeeper mutators. Настройка Oathkeeper rules, Kratos sessions, Keto permissions и app-specific host defaults остаются вне этого пакета.

## Для Кого

- Для NestJS-приложений, которым нужно спрашивать Oathkeeper, разрешён ли входящий request.
- Для сервисов, которым нужен типизированный decision result со status и response headers.
- Для приложений, которым нужно обогащать request mutator-заголовками, например `authorization` и `x-user`.

## Что Умеет Пакет

- Даёт `OathkeeperModule.register` и `OathkeeperModule.registerAsync`.
- Экспортирует `OathkeeperDecisionService` для типизированных вызовов Decisions API.
- Передаёт request-контекст через `X-Forwarded-Method`, `X-Forwarded-Proto`, `X-Forwarded-Host` и `X-Forwarded-Uri`.
- Нормализует deny-ответы Oathkeeper `401` и `403` в decision result, не считая их неожиданной transport-ошибкой.
- Даёт `OathkeeperIdentityMiddleware` для enforcement-режима или явно выбранного enrichment-only режима.

## Установка

```bash
yarn add @atls/nestjs-oathkeeper
```

## Быстрый Старт

```typescript
import { Module }           from '@nestjs/common'

import { OathkeeperModule } from '@atls/nestjs-oathkeeper'

@Module({
  imports: [
    OathkeeperModule.register({
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
      decision: {
        forwardedHost: 'example.com',
      },
    }),
  ],
})
export class AppModule {}
```

Используйте `OathkeeperDecisionService`, если прикладному коду нужен сам decision result:

```typescript
import { Injectable }                from '@nestjs/common'

import { OathkeeperDecisionService } from '@atls/nestjs-oathkeeper'

@Injectable()
export class AccessService {
  constructor(private readonly decisions: OathkeeperDecisionService) {}

  async check(request: Request): Promise<boolean> {
    const decision = await this.decisions.decide({
      method: request.method,
      uri: new URL(request.url).pathname,
      host: request.headers.get('host') ?? undefined,
      proto: 'https',
      headers: {
        authorization: request.headers.get('authorization') ?? undefined,
        cookie: request.headers.get('cookie') ?? undefined,
      },
    })

    return decision.allowed
  }
}
```

## Middleware

`OathkeeperIdentityMiddleware` по умолчанию работает в режиме `enforce`. Middleware читает Fastify request `url`, `hostname`, `protocol` и `headers`. Deny-решения превращаются в NestJS HTTP exceptions, а allowed-решения копируют настроенные mutator headers в request.

```typescript
OathkeeperModule.register({
  urls: {
    api: 'http://oathkeeper-api:4456',
  },
  middleware: {
    mode: 'enforce',
  },
})
```

Используйте режим `enrich` только если приложению нужно продолжать обработку request после denied decision и брать заголовки только из allowed decisions, когда они есть.

```typescript
OathkeeperModule.register({
  urls: {
    api: 'http://oathkeeper-api:4456',
  },
  middleware: {
    mode: 'enrich',
  },
})
```

## Decision Headers

По умолчанию middleware прокидывает:

- `authorization`
- `x-user`

Настройте `decision.responseHeaders`, если Oathkeeper mutators возвращают другой публичный header contract:

```typescript
OathkeeperModule.register({
  urls: {
    api: 'http://oathkeeper-api:4456',
  },
  decision: {
    responseHeaders: ['authorization', 'x-user', 'x-tenant'],
  },
})
```

## Ошибки

- `OathkeeperModuleOptionsError` выбрасывается при невалидных `registerAsync` options.
- `OathkeeperDecisionConfigurationError` выбрасывается, когда decision request нельзя собрать из request или module options.
- `OathkeeperDecisionRequestError` выбрасывается, когда Oathkeeper возвращает provider failure вместо decision-статусов `200`, `401` или `403`.
