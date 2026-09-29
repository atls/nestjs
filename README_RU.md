![nestjs-github-cover](https://user-images.githubusercontent.com/102182195/235650080-e661338e-4466-43f7-84fc-f801558495eb.png)

# ATLS | NestJS

[English](README.md) | [Русский](README_RU.md)

NestJS Infrastructure-first toolkit

- CQRS, gRPC, Kafka, Auth, Storage

## Что внутри

### Transport

- gRPC (errors, reflection, playground, http-proxy)
- ConnectRPC (errors)
- GraphQL (redis-subscriptions)

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

## Почему это удобно

- NestJS не даёт готовых модулей для работы с gRPC, Kafka, системами аутентификации, API-шлюзами и поисковыми движками
- В продакшене это быстро превращается в набор самописных решений и постоянный перенос одной и той же инфраструктурной логики между сервисами.

Этот репозиторий — набор инфраструктурных модулей для NestJS,
которые закрывают эти задачи из коробки
и позволяют не собирать одну и ту же инфру руками в каждом проекте.

## 🚀 Примеры

- [`grpc-http-proxy`](examples/grpc-http-proxy) - пример HTTP-прокси для gRPC-сервисов
- [`grpc-playground`](examples/grpc-playground) - пример использования gRPC Playground
- [`grpc-reflection`](examples/grpc-reflection) - пример использования gRPC Server Reflection

## Миграция

- [Переход со старого GraphQL gateway на Mesh v1 и Hive Nest driver](docs/nestjs-gateway-migration.md)
