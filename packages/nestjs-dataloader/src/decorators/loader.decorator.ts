import { ExecutionContext }             from '@nestjs/common'
import { InternalServerErrorException } from '@nestjs/common'
import { APP_INTERCEPTOR }              from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'
import { GraphQLExecutionContext }      from '@nestjs/graphql'
import { createParamDecorator }         from '@nestjs/common'

import { GET_LOADER_CONTEXT_KEY }       from '../constants'
import { DataLoaderInterceptor }        from '../interceptors/data-loader.interceptor'

export const Loader: (type: string) => ParameterDecorator = createParamDecorator((
  type: string,
  context: ExecutionContext
) => {
  const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
  const ctx: any = graphqlExecutionContext.getContext()

  if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
    throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globaly with ${APP_INTERCEPTOR}
      `)
  }

  return ctx[GET_LOADER_CONTEXT_KEY](type)
})
