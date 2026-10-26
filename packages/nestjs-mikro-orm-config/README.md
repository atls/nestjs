# NestJS MikroORM configuration

Supports NestJS 11 and 12 with MikroORM 7 and `@mikro-orm/nestjs` 7. The development graph exercises NestJS 12.2.

Import `MikroORMConfigModule.register(options)` to expose the injectable `MikroORMConfig` options factory. Configuration provider tests resolve the factory without requiring a database connection.
