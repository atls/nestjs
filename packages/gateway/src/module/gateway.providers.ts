import { Provider }                from '@nestjs/common'
import { EventEmitter }            from 'events'
import { PubSub }                  from 'graphql-subscriptions'

import { GraphQLMeshHandler }      from '../mesh/index.js'
import { GraphQLMeshConfig }       from '../mesh/index.js'
import { GraphQLMesh }             from '../mesh/index.js'
import { GraphQLMeshSchemaDumper } from '../mesh/index.js'
import { GatewayModuleOptions }    from './gateway-module-options.interface.js'
import { GATEWAY_MODULE_OPTIONS }  from './gateway.constants.js'

export const createGatewayOptionsProvider = (options: GatewayModuleOptions): Provider[] => [
  {
    provide: GATEWAY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGatewayProvider = (): Provider[] => [
  GraphQLMeshConfig,
  GraphQLMeshHandler,
  GraphQLMesh,
  GraphQLMeshSchemaDumper,
]

export const createGatewayExportsProvider = (): Provider[] => [
  {
    provide: PubSub,
    useFactory: (options: GatewayModuleOptions) => {
      if (options.pubsub) {
        return options.pubsub
      }

      const eventEmitter = new EventEmitter({ captureRejections: true })

      eventEmitter.setMaxListeners(Infinity)

      return new PubSub({ eventEmitter })
    },
    inject: [GATEWAY_MODULE_OPTIONS],
  },
]
