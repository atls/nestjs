import type { CallHandler }             from '@nestjs/common'
import type { ExecutionContext }        from '@nestjs/common'
import type { NestInterceptor }         from '@nestjs/common'
import type { GraphQLExecutionContext } from '@nestjs/graphql'
import type { Observable }              from 'rxjs'
import type DataLoader                 from 'dataloader'

import type { NestDataLoader }          from '../interfaces/index.js'

import { Injectable }                   from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { ModuleRef }                    from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'

import { GET_LOADER_CONTEXT_KEY }       from '../constants.js'

type LoaderContext = Record<string, unknown> & {
  GET_LOADER_CONTEXT_KEY?: (type: string) => DataLoader<unknown, unknown>
}

@Injectable()
export class DataLoaderInterceptor implements NestInterceptor {
  constructor(private readonly moduleRef: ModuleRef) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
    const ctx = graphqlExecutionContext.getContext<LoaderContext>()
    const loaders = ctx as LoaderContext & Record<string, DataLoader<unknown, unknown> | undefined>

    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      ctx[GET_LOADER_CONTEXT_KEY] = (type: string): DataLoader<unknown, unknown> => {
        const existing = loaders[type]
        if (existing) {
          return existing
        }

        try {
          const loader = this.moduleRef
            .get<NestDataLoader>(type, { strict: false })
            .generateDataLoader()

          loaders[type] = loader

          return loader
        } catch {
          throw new InternalServerErrorException(`The loader ${type} is not provided`)
        }
      }
    }

    return next.handle()
  }
}
