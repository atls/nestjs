# ATLS NestJS Oathkeeper

[![Oathkeeper Docs EN](https://img.shields.io/badge/Oathkeeper%20Docs-EN-1f8a70)](README.md)
[![Oathkeeper Docs RU](https://img.shields.io/badge/Oathkeeper%20Docs-RU-0b5fff)](README_RU.md)

## What This Is

`@atls/nestjs-oathkeeper` is a NestJS package for integrating applications with Ory Oathkeeper Access Control Decision API.

The package owns NestJS module wiring, typed decision calls, Fastify request-to-decision header mapping, and optional request enrichment from Oathkeeper mutator response headers. Oathkeeper rule configuration, Kratos sessions, Keto permissions, and application-specific host defaults stay outside this package.

## Who It Is For

- NestJS applications that need to ask Oathkeeper whether an incoming request is allowed.
- Services that want a typed decision result with status and response headers.
- Applications that need to enrich a request with mutator headers such as `authorization` and `x-user`.

## What The Package Can Do

- Connect a NestJS application to Oathkeeper through the usual synchronous or asynchronous module configuration.
- Build the minimal request context Oathkeeper needs for an access check: method, scheme, host, path, and source headers.
- Return an application-facing access result: whether the request is allowed, which HTTP status Oathkeeper returned, and which headers should be propagated.
- Treat `401` and `403` as regular access denials instead of network or Oathkeeper client failures.
- Run as NestJS middleware to reject denied requests or enrich allowed requests with identity headers.

## Installation

```bash
yarn add @atls/nestjs-oathkeeper
```

## Quickstart

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

Use `OathkeeperDecisionService` when application code needs the decision result directly:

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

`OathkeeperIdentityMiddleware` uses `enforce` mode by default. It reads the Fastify request `url`, `hostname`, `protocol`, and `headers`. Denied decisions throw NestJS HTTP exceptions, and allowed decisions copy configured mutator headers into the request.

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

Use `enrich` mode only when the application wants to continue request handling after a denied decision and only use headers from allowed decisions when they exist.

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

By default, middleware propagates:

- `authorization`
- `x-user`

Configure `decision.responseHeaders` when Oathkeeper mutators produce a different public header contract:

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

## Errors

- `OathkeeperModuleOptionsError` is thrown for invalid `registerAsync` options.
- `OathkeeperDecisionConfigurationError` is thrown when the decision request cannot be built from request or module options.
- `OathkeeperDecisionRequestError` is thrown when Oathkeeper returns a non-decision provider failure instead of `200`, `401`, or `403`.
