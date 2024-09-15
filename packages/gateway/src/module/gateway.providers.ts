import { Provider }                from '@nestjs/common'
import { EventEmitter }            from 'events'
import { PubSub }                  from 'graphql-subscriptions'

import { GraphQLMeshHandler }      from '../mesh'
import { GraphQLMeshConfig }       from '../mesh'
import { GraphQLMesh }             from '../mesh'
import { GraphQLMeshSchemaDumper } from '../mesh'
import { GatewayModuleOptions }    from './gateway-module-options.interface'
import { GATEWAY_MODULE_OPTIONS }  from './gateway.constants'

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
