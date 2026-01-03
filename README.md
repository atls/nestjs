![nestjs-github-cover](https://user-images.githubusercontent.com/102182195/235650080-e661338e-4466-43f7-84fc-f801558495eb.png)

# @atls/nestjs

NestJS Infrastructure-first toolkit

- CQRS, gRPC, Kafka, Auth, Storage

## What’s inside

### Transport

- gRPC (errors, reflection, playground, http-proxy)
- ConnectRPC (errors)
- GraphQL Gateway (redis-subscriptions)

### Messaging & Async

- Kafka (cqrs)
- CQRS
- Batch Queue

### Auth & Identity

- Hydra
- Kratos
- Keto
- gRPC Identity

### Persistence & Infra

- Redis
- S3 / GCS
- MikroORM / TypeORM
- Typesense (typeorm)
- Signed URL

### DX & Utilities

- Logger
- Validation
- Pipes
- Proto Types
- Dataloader
- Microservices Registry
- External Renderer

## Development

This repo uses [Yarn 4](https://yarnpkg.com/) and [ESM](https://nodejs.org/api/esm.html).

### Build

```bash
yarn workspaces run build
```

## Why

- opinionated infra
- consistent error model
- zero glue code between services
- production-first defaults

## 🚀 Examples

- [`grpc-http-proxy`](examples/grpc-http-proxy) - пример HTTP-прокси для gRPC-сервисов.
- [`grpc-playground`](examples/grpc-playground) - пример использования gRPC Playground.
- [`grpc-reflection`](examples/grpc-reflection) - пример использования gRPC Server Reflection.
