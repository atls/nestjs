import { CallHandler }                  from '@nestjs/common'
import { ExecutionContext }             from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { NestInterceptor }              from '@nestjs/common'
import { ModuleRef }                    from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'
import { GraphQLExecutionContext }      from '@nestjs/graphql'

import { Observable }                   from 'rxjs'

import { GET_LOADER_CONTEXT_KEY }       from '../constants'
import { NestDataLoader }               from '../interfaces/nest-dataloader.interfaces'

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

        return ctx[type]
      }
    }

    return next.handle()
  }
}
