import type { IncomingMessage }       from 'node:http'
import type { Socket }                from 'node:net'

import type { GatewayModuleOptions }  from '../../module/interfaces.js'
import type { GatewayGraphQLRuntime } from '../interfaces.js'

export interface GatewayHttpServer {
  on: (
    event: 'upgrade',
    handler: (req: IncomingMessage, socket: Socket, head: Buffer) => void
  ) => void
}

export interface GatewayHttpBoundary {
  register: (runtime: GatewayGraphQLRuntime, options: GatewayModuleOptions) => Promise<void>
}
