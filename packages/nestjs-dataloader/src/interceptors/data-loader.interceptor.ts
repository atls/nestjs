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
  private readonly loaderFactorySymbol = GET_LOADER_CONTEXT_KEY

  constructor(private readonly moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
    const ctx = graphqlExecutionContext.getContext<Record<string, unknown>>()

    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      ctx[this.loaderFactorySymbol] = (type: string): NestDataLoader => {
        if (ctx[type] === undefined) {
          try {
            ctx[type] = this.moduleRef
              .get<NestDataLoader>(type, { strict: false })
              .generateDataLoader()
          } catch {
            throw new InternalServerErrorException(`The loader ${type} is not provided`)
          }
        }

        return ctx[type] as NestDataLoader
      }
    }

    return next.handle()
  }
}
