# NestJS CQRS

Import `CqrsModule.forRoot()` and register command, query and event handlers as Nest providers. The module discovers handlers during application bootstrap.

`CqrsModule` delegates to the public upstream module. Handler discovery and bus lifecycle remain owned by `@nestjs/cqrs`; private upstream services are not imported or exported by this package.
