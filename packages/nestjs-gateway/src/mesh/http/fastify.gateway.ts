import type { GatewayModuleOptions } from '../../module/gateway-module-options.interface.js'
import type { GatewayGraphQLRuntime }         from '../interfaces.js'
import type { GatewayHttpBoundary }           from '../interfaces.js'

import { Injectable }                         from '@nestjs/common'

import { GatewayUnsupportedHttpAdapterError } from '../errors/unsupported.js'

@Injectable()
export class FastifyGraphQLGateway implements GatewayHttpBoundary {
  async register(_runtime: GatewayGraphQLRuntime, _options: GatewayModuleOptions): Promise<void> {
    throw new GatewayUnsupportedHttpAdapterError('fastify')
  }
}
