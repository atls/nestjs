# @atls/grpc-keto

Интеграция с `keto` на уровне контроллера.

Принцип действия:

```ts
import { GuardedByKeto } from '@atls/grpc-keto'
import { KetoGuard }     from '@atls/grpc-keto'

@Controller()
export class Controller {
  @Get('/protected-by-keto')
  @GuardedByKeto((user) => `Group:admin#members@${user}`)
  @UseGuards(KetoGuard)
  async protect() {
    return status.OK
  }
}
```

- `@GuardedByKeto` - декоратор в котором обозначаем `relation-tuple` для доступа к ресурсу. Можно
  либо строкой, либо с подменой значения далее через функцию.
- `@UseGuards(KetoGuard)` - гард для обработки `relation-tuple` из декоратора и запроса к `keto`
  self-host разрешения на доступ.

Подмена происходит так:

```ts
@Injectable()
export class KetoGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(KETO_READ_CLIENT) private readonly ketoReadClient: KetoReadClientService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const userId = this.getUserId(context)

      if (!userId) return false

      const relationTuple = getGuardingRelationTuple(this.reflector, context.getHandler())

      if (relationTuple === null) return false

      const converter = new RelationTupleConverter(relationTuple, userId)
```

`RelationTupleConverter` принимает во втором аргументе возможную подмену и заменяет ее в строке при
создании объекта `RelationTuple`, с которым работает `@ory/grpc-client`
