# NestJS validation

Import `ValidationModule.register()` to inject `Validator`. `validate(value, metatype)` transforms input into the supplied class and validates its decorators. Invalid input throws `ValidationError` with the underlying property constraints in `errors`.
