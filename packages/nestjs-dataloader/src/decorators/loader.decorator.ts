import type { ExecutionContext }        from '@nestjs/common'
import type { GraphQLExecutionContext } from '@nestjs/graphql'

import { InternalServerErrorException } from '@nestjs/common'
import { APP_INTERCEPTOR }              from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'
import { createParamDecorator }         from '@nestjs/common'

import { GET_LOADER_CONTEXT_KEY }       from '../constants.js'
import { DataLoaderInterceptor }        from '../interceptors/index.js'

export const Loader: (type: string) => ParameterDecorator = createParamDecorator((
  type: string,
  context: ExecutionContext
) => {
  const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
  const ctx = graphqlExecutionContext.getContext<Record<string, unknown>>()

  const loaderFactory = ctx[GET_LOADER_CONTEXT_KEY]

  if (loaderFactory === undefined || typeof loaderFactory !== 'function') {
    throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globaly with ${APP_INTERCEPTOR}
      `)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return loaderFactory(type)
})
