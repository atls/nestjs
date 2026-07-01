import type { ObjectTypeDefinitionNode } from 'graphql'

import assert                            from 'node:assert/strict'
import { mkdtemp }                       from 'node:fs/promises'
import { rm }                            from 'node:fs/promises'
import { writeFile }                     from 'node:fs/promises'
import { tmpdir }                        from 'node:os'
import { join }                          from 'node:path'
import { describe }                      from 'node:test'
import { it }                            from 'node:test'

import { MemPubSub }                     from '@graphql-hive/pubsub'
import { toMeshPubSub }                  from '@graphql-mesh/types'

import { GraphQLMeshConfig }             from '../graphql-mesh.config.js'

describe('GraphQLMeshConfig', () => {
  it('resolves array-based type definition paths', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'nestjs-gateway-'))

    try {
      const schemaPath = join(directory, 'schema.graphql')

      await writeFile(schemaPath, 'type AdditionalType { id: ID! }')

      const config = new GraphQLMeshConfig(
        {
          additionalTypeDefs: [schemaPath],
        },
        toMeshPubSub(new MemPubSub())
      )
      const options = await config.create()
      const definition = options.additionalTypeDefs?.[0]?.definitions[0] as
        | ObjectTypeDefinitionNode
        | undefined

      assert.equal(definition?.name.value, 'AdditionalType')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})
