# NestJS validation

Supports NestJS 10, 11 and 12. The development graph exercises NestJS 12.2.

Import `ValidationModule.register()` to inject `Validator`. `validate(value, metatype)` transforms input into the supplied class and validates its decorators. Invalid input throws `ValidationError` with the underlying property constraints in `errors`.
