![nestjs-github-cover](https://user-images.githubusercontent.com/102182195/235650080-e661338e-4466-43f7-84fc-f801558495eb.png)

# ATLS | NestJS

[English](README.md) | [Русский](README_RU.md)

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

## Why this repo exists

- NestJS does not provide built-in modules for gRPC, Kafka, authentication systems,
  API gateways, or search engines
- In production, this usually turns into custom glue code
  and repeated infrastructure logic copied across services

This repository provides infrastructure-level modules for NestJS
that cover these concerns out of the box
and remove the need to reimplement the same infra in every project.

## 🚀 Examples

- [`grpc-http-proxy`](examples/grpc-http-proxy) - Echo HTTP proxy for gRPC services example
- [`grpc-playground`](examples/grpc-playground) - gRPC Playground integration example
- [`grpc-reflection`](examples/grpc-reflection) - gRPC Server Reflection usage example
