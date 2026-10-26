# NestJS CQRS

Supports NestJS 10, 11 and 12 with the matching `@nestjs/cqrs` major. The development graph exercises NestJS 12.2 and CQRS 12.1.

Import `CqrsModule.forRoot()` and register command, query and event handlers as Nest providers. The module discovers handlers during application bootstrap.

`CqrsModule` delegates to the public upstream module. Handler discovery and bus lifecycle remain owned by `@nestjs/cqrs`; private upstream services are not imported or exported by this package.
