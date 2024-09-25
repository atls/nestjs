import type { CallHandler }             from '@nestjs/common'
import type { ExecutionContext }        from '@nestjs/common'
import type { NestInterceptor }         from '@nestjs/common'
import type { GraphQLExecutionContext } from '@nestjs/graphql'
import type { Observable }              from 'rxjs'

import type { NestDataLoader }          from '../interfaces/index.js'

import { Injectable }                   from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { ModuleRef }                    from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'

import { GET_LOADER_CONTEXT_KEY }       from '../constants.js'

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
    const ctx: any = graphqlExecutionContext.getContext()

    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      ctx[GET_LOADER_CONTEXT_KEY] = (type: string): NestDataLoader => {
        if (ctx[type] === undefined) {
          try {
            ctx[type] = this.moduleRef
              .get<NestDataLoader>(type, { strict: false })
              .generateDataLoader()
          } catch (e) {
            throw new InternalServerErrorException(`The loader ${type} is not provided`)
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return ctx[type]
      }
    }

    return next.handle()
  }
}
