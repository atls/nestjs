import type { ExecutionContext }        from '@nestjs/common'
import type { GraphQLExecutionContext } from '@nestjs/graphql'
import type DataLoader                 from 'dataloader'

import { InternalServerErrorException } from '@nestjs/common'
import { APP_INTERCEPTOR }              from '@nestjs/core'
import { GqlExecutionContext }          from '@nestjs/graphql'
import { createParamDecorator }         from '@nestjs/common'

import { GET_LOADER_CONTEXT_KEY }       from '../constants.js'
import { DataLoaderInterceptor }        from '../interceptors/index.js'

type LoaderContext = Record<string, unknown> & {
  GET_LOADER_CONTEXT_KEY?: (type: string) => DataLoader<unknown, unknown>
}

export const Loader: (type: string) => ParameterDecorator = createParamDecorator((
  type: string,
  context: ExecutionContext
) => {
  const graphqlExecutionContext: GraphQLExecutionContext = GqlExecutionContext.create(context)
  const ctx = graphqlExecutionContext.getContext<LoaderContext>()

  if (ctx[GET_LOADER_CONTEXT_KEY] === undefined) {
    throw new InternalServerErrorException(`
        You should provide interceptor ${DataLoaderInterceptor.name} globaly with ${APP_INTERCEPTOR}
      `)
  }

  const getLoader = ctx[GET_LOADER_CONTEXT_KEY] as (
    type: string
  ) => DataLoader<unknown, unknown>

  return getLoader(type)
})
