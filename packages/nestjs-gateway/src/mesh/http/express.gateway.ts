import type { CorsOptions }           from 'cors'
import type { Express }               from 'express'
import type { RequestHandler }        from 'express'

import type { GatewayModuleOptions }  from '../../module/interfaces.js'
import type { GatewayGraphQLRuntime } from '../interfaces.js'
import type { GatewayHttpBoundary }   from './interfaces.js'

import { Injectable }                 from '@nestjs/common'
import { HttpAdapterHost }            from '@nestjs/core'
import { expressMiddleware }          from '@as-integrations/express4'
import { json }                       from 'express'
import corsMiddleware                 from 'cors'

import { createUploadMiddleware }     from './uploads.js'

const APOLLO_HEALTH_CHECK_PATH = '/.well-known/apollo/server-health'
const APOLLO_HEALTH_CHECK_CONTENT_TYPE = 'application/health+json'
const APOLLO_HEALTH_CHECK_RESPONSE = { status: 'pass' }

@Injectable()
export class ExpressGraphQLGateway implements GatewayHttpBoundary {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  async register(runtime: GatewayGraphQLRuntime, options: GatewayModuleOptions): Promise<void> {
    const app = this.adapterHost.httpAdapter.getInstance<Express>()
    const { path = '/', cors } = options

    app.get(APOLLO_HEALTH_CHECK_PATH, (_, response) => {
      response.type(APOLLO_HEALTH_CHECK_CONTENT_TYPE)
      response.json(APOLLO_HEALTH_CHECK_RESPONSE)
    })

    const middleware: Array<RequestHandler> = [
      ...(cors === false
        ? []
        : [corsMiddleware(cors === true ? undefined : (cors as CorsOptions))]),
      ...createUploadMiddleware(options.uploads),
      json({
        limit: options.limit || undefined,
      }),
      expressMiddleware(runtime.apolloServer, {
        context: async ({ req, res }) => runtime.contextBuilder({ req, res }),
      }),
    ]

    app.use(path, ...middleware)
  }
}
