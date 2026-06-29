import type { CorsOptions }           from 'cors'
import type { Express }               from 'express'

import type { GatewayModuleOptions }  from '../../module/index.js'
import type { GatewayGraphQLRuntime } from '../interfaces.js'
import type { GatewayHttpBoundary }   from '../interfaces.js'

import { Injectable }                 from '@nestjs/common'
import { HttpAdapterHost }            from '@nestjs/core'
import { expressMiddleware }          from '@as-integrations/express4'
import { json }                       from 'express'
import corsMiddleware                 from 'cors'

@Injectable()
export class ExpressGraphQLGateway implements GatewayHttpBoundary {
  constructor(private readonly adapterHost: HttpAdapterHost) {}

  async register(runtime: GatewayGraphQLRuntime, options: GatewayModuleOptions): Promise<void> {
    const app = this.adapterHost.httpAdapter.getInstance<Express>()
    const { path = '/', cors } = options

    const middleware = [
      ...(cors === false
        ? []
        : [corsMiddleware(cors === true ? undefined : (cors as CorsOptions))]),
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
