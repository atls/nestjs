import type { Provider }               from '@nestjs/common'

import type { TypesenseModuleOptions } from './typesense-module.interface.js'

import { Client }                      from 'typesense'

import { TypesenseCollectionsCreator } from '../collections/index.js'
import { TypesenseMetadataAccessor }   from '../metadata/index.js'
import { TypesenseMetadataExplorer }   from '../metadata/index.js'
import { TypesenseMetadataRegistry }   from '../metadata/index.js'
import { TYPESENSE_MODULE_OPTIONS }    from './typesense.constants.js'

export const createTypesenseOptionsProvider = (
  options: TypesenseModuleOptions = {}
): Array<Provider> => [
  {
    provide: TYPESENSE_MODULE_OPTIONS,
    useValue: options,
  },
]

export const createTypesenseProvider = (): Array<Provider> => [
  TypesenseMetadataAccessor,
  TypesenseMetadataExplorer,
  TypesenseMetadataRegistry,
  TypesenseCollectionsCreator,
]

export const createTypesenseExportsProvider = (): Array<Provider> => [
  TypesenseMetadataRegistry,
  {
    provide: Client,
    useFactory: (options: TypesenseModuleOptions) =>
      new Client({
        nodes: options.nodes || [
          {
            host:
              process.env.TYPESENSE_HOST || process.env.NODE_ENV === 'production'
                ? 'ts.typesense.svc.cluster.local'
                : 'localhost',
            port: 8108,
            protocol: 'http',
          },
        ],
        numRetries: options.numRetries || 10,
        apiKey: options.apiKey ?? process.env.TYPESENSE_API_KEY!,
        connectionTimeoutSeconds: options.connectionTimeoutSeconds || 10,
        retryIntervalSeconds: options.retryIntervalSeconds || 0.1,
        healthcheckIntervalSeconds: options.healthcheckIntervalSeconds || 2,
        logLevel: options.logLevel ?? 'info',
      }),
    inject: [TYPESENSE_MODULE_OPTIONS],
  },
]
