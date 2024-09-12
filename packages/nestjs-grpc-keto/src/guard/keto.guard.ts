import { Metadata }                 from '@grpc/grpc-js'
import { Inject }                   from '@nestjs/common'
import { ExecutionContext }         from '@nestjs/common'
import { Injectable }               from '@nestjs/common'
import { CanActivate }              from '@nestjs/common'
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
    const contextType = ctx.getType() as string

    let metadata: Metadata | any

    switch (contextType) {
      case 'graphql':
        metadata = GqlExecutionContext.create(ctx).getContext() as Metadata

        return metadata.user

      case 'rpc':
        metadata = ctx.switchToRpc().getContext() as Metadata

        return (metadata.get('x_user') ?? metadata.get('x-user')).toString()

      default:
        metadata = ctx.switchToHttp().getRequest() as Metadata

        return metadata.get('x_user') ?? metadata.get('x-user')
    }
  }
}
