import type { Provider }             from '@nestjs/common'

import type { GatewayModuleOptions } from './gateway-module-options.interface.js'

import { EventEmitter }              from 'events'
import { PubSub }                    from 'graphql-subscriptions'

import { GraphQLMeshHandler }        from '../mesh/index.js'
import { GraphQLMeshConfig }         from '../mesh/index.js'
import { GraphQLMesh }               from '../mesh/index.js'
import { GraphQLMeshSchemaDumper }   from '../mesh/index.js'
import { GATEWAY_MODULE_OPTIONS }    from './gateway.constants.js'

export const createGatewayOptionsProvider = (options: GatewayModuleOptions): Array<Provider> => [
  {
    provide: GATEWAY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGatewayProvider = (): Array<Provider> => [
  GraphQLMeshConfig,
  GraphQLMeshHandler,
  GraphQLMesh,
  GraphQLMeshSchemaDumper,
]

export const createGatewayExportsProvider = (): Array<Provider> => [
  {
    provide: PubSub,
    useFactory: (options: GatewayModuleOptions): PubSub => {
      if (options.pubsub) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return options.pubsub
      }

      const eventEmitter = new EventEmitter({ captureRejections: true })

      eventEmitter.setMaxListeners(Infinity)

      return new PubSub({ eventEmitter })
    },
    inject: [GATEWAY_MODULE_OPTIONS],
  },
]
