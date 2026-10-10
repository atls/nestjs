# @atls/nestjs-mikro-orm-config

The current release targets MikroORM 7 and NestJS 11. By default it configures the legacy decorator metadata provider and registers MikroORM's Migrator extension for projects using this module's `migrationsList` option. Applications using MikroORM 7 legacy decorators must import them from `@mikro-orm/decorators/legacy`.

Projects that still use MikroORM 5 and NestJS 10 should retain the previous package release until they migrate.
