import type { MeshPubSub }           from '@graphql-mesh/types'
import type { Provider }             from '@nestjs/common'

import type { GatewayModuleOptions } from './gateway-module-options.interface.js'

import { MemPubSub }                 from '@graphql-hive/pubsub'
import { toMeshPubSub }              from '@graphql-mesh/types'

import { ExpressGraphQLGateway }     from '../mesh/index.js'
import { FastifyGraphQLGateway }     from '../mesh/index.js'
import { GraphQLMeshHandler }        from '../mesh/index.js'
import { GraphQLMeshConfig }         from '../mesh/index.js'
import { GraphQLMesh }               from '../mesh/index.js'
import { GraphQLMeshRuntime }        from '../mesh/index.js'
import { GraphQLMeshSchemaDumper }   from '../mesh/index.js'
import { GATEWAY_MESH_PUBSUB }       from './gateway.constants.js'
import { GATEWAY_MODULE_OPTIONS }    from './gateway.constants.js'

export const createGatewayOptionsProvider = (options: GatewayModuleOptions): Array<Provider> => [
  {
    provide: GATEWAY_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createGatewayProvider = (): Array<Provider> => [
  ExpressGraphQLGateway,
  FastifyGraphQLGateway,
  GraphQLMeshConfig,
  GraphQLMeshHandler,
  GraphQLMesh,
  GraphQLMeshRuntime,
  GraphQLMeshSchemaDumper,
]

export const createGatewayExportsProvider = (): Array<Provider> => [
  {
    provide: GATEWAY_MESH_PUBSUB,
    useFactory: (options: GatewayModuleOptions): MeshPubSub => {
      if (options.pubsub) {
        return toMeshPubSub(options.pubsub)
      }

      return toMeshPubSub(new MemPubSub())
    },
    inject: [GATEWAY_MODULE_OPTIONS],
  },
]
