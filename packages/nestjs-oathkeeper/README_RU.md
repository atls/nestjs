# ATLS NestJS Oathkeeper

[![Oathkeeper Docs EN](https://img.shields.io/badge/Oathkeeper%20Docs-EN-1f8a70)](README.md)
[![Oathkeeper Docs RU](https://img.shields.io/badge/Oathkeeper%20Docs-RU-0b5fff)](README_RU.md)

## Что это

@atls/nestjs-oathkeeper — NestJS-пакет для подключения приложений к
[Ory Oathkeeper](https://github.com/ory/oathkeeper) и его API принятия решений
о доступе.

Пакет берёт на себя подключение NestJS-модуля, типизированную проверку доступа,
преобразование контекста запроса Fastify в заголовки Ory Oathkeeper и
добавление в запрос заголовков, которые вернули мутаторы Ory Oathkeeper.
Настройка правил Ory Oathkeeper, сессий Kratos, разрешений Keto и значений
хоста по умолчанию остаётся вне этого пакета.

## Для кого

- Для NestJS-приложений, которым нужно проверять входящий запрос через
  Ory Oathkeeper
- Для сервисов, которым нужен типизированный результат проверки доступа с
  HTTP-статусом и заголовками ответа
- Для приложений, которым нужно добавлять в запрос заголовки, возвращённые
  мутаторами Ory Oathkeeper, например authorization и x-user

## Что умеет пакет

- Подключает приложение к Ory Oathkeeper через обычную для NestJS синхронную
  или асинхронную настройку модуля
- Собирает из входящего запроса минимальный контекст, который нужен
  Ory Oathkeeper для проверки доступа: метод, схему, хост, путь и исходные
  заголовки
- Возвращает прикладному коду понятный результат проверки: запрос разрешён или
  запрещён, какой HTTP-статус вернул Ory Oathkeeper и какие заголовки нужно
  передать дальше
- Считает 401 и 403 штатным запретом доступа, а не ошибкой сетевого слоя или
  клиента Ory Oathkeeper
- Может работать как промежуточный обработчик NestJS: блокировать запрещённые
  запросы или только дополнять разрешённые запросы заголовками идентичности

## Установка

```bash
yarn add @atls/nestjs-oathkeeper
```

## Быстрый старт

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

Используйте OathkeeperDecisionService, если прикладному коду нужен результат проверки доступа:

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

## Промежуточный обработчик

OathkeeperIdentityMiddleware по умолчанию работает в режиме enforce. Обработчик
читает из запроса Fastify поля url, hostname, protocol и headers. Запрещающие
решения превращаются в HTTP-исключения NestJS, а разрешающие решения копируют
настроенные заголовки мутаторов в запрос.

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

Используйте режим enrich только если приложению нужно продолжать обработку запроса после запрета доступа и брать заголовки только из разрешающих решений, когда они есть.

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

## Заголовки ответа

По умолчанию обработчик передаёт дальше:

- authorization
- x-user

Настройте decision.responseHeaders, если мутаторы Ory Oathkeeper возвращают другой публичный набор заголовков:

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

- OathkeeperModuleOptionsError выбрасывается при неправильной настройке
  registerAsync
- OathkeeperDecisionConfigurationError выбрасывается, когда запрос к
  Ory Oathkeeper нельзя собрать из входящего запроса или настроек модуля
- OathkeeperDecisionRequestError выбрасывается, когда Ory Oathkeeper возвращает
  сбой провайдера вместо статусов проверки доступа 200, 401 или 403
