import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common'
import { APP_INTERCEPTOR }                              from '@nestjs/core'
import { GqlExecutionContext, GraphQLExecutionContext } from '@nestjs/graphql'

import { GET_LOADER_CONTEXT_KEY }                       from '../constants'
import { DataLoaderInterceptor }                        from '../interceptors/DataLoaderInterceptor'

export const Loader: (type: string) => ParameterDecorator = createParamDecorator(
  (type: string, context: ExecutionContext) => {
    const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
    const ctx: any = graphqlExecutionContext.getContext()

    if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
      throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globaly with ${APP_INTERCEPTOR}
      `)
    }

    return ctx[GET_LOADER_CONTEXT_KEY](type)
  }
)
