import type { ExecutionContext }    from '@nestjs/common'
import type { CanActivate }         from '@nestjs/common'

import { Inject }                   from '@nestjs/common'
import { Injectable }               from '@nestjs/common'
import { Reflector }                from '@nestjs/core'
import { GqlExecutionContext }      from '@nestjs/graphql'

import { KetoGeneralException }     from '../exceptions/index.js'
import { KETO_READ_CLIENT }         from '../module/index.js'
import { KetoReadClientService }    from '../services/index.js'
import { RelationTupleConverter }   from '../utils/index.js'
import { getGuardingRelationTuple } from '../decorators/index.js'

@Injectable()
export class KetoGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(KETO_READ_CLIENT) private readonly ketoReadClient: KetoReadClientService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const userId = this.getUserId(context)

      if (!userId) return false

      const relationTuple = getGuardingRelationTuple(this.reflector, context.getHandler())

      if (relationTuple === null) return false

      const converter = new RelationTupleConverter(relationTuple, userId)

      const tuple = converter.run()

      return await this.ketoReadClient.validateRelationTuple(tuple)
    } catch (err) {
      throw new KetoGeneralException((err as Error).toString())
    }
  }

  private getUserId(ctx: ExecutionContext): string | null {
    const contextType = ctx.getType<string>()

    let metadata

    switch (contextType) {
      case 'graphql':
        metadata = GqlExecutionContext.create(ctx).getContext()

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return metadata.user

      default:
        metadata = ctx.switchToHttp().getRequest()

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return metadata.get('x_user') ?? metadata.get('x-user')
    }
  }
}
