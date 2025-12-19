/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import type { OnModuleInit }         from '@nestjs/common'

import { promises as fs }            from 'node:fs'
import { join }                      from 'node:path'

import { Injectable }                from '@nestjs/common'
import { printSchemaWithDirectives } from '@graphql-tools/utils'

import { GraphQLMesh }               from './graphql.mesh.js'

declare const __non_webpack_require__: NodeRequire | undefined

@Injectable()
export class GraphQLMeshSchemaDumper implements OnModuleInit {
  constructor(private readonly mesh: GraphQLMesh) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const { schema } = await this.mesh.getInstance()

      await fs.writeFile(
        join(
          typeof __non_webpack_require__ === 'undefined' ? process.cwd() : `${__dirname}/../`,
          'gateway.graphql'
        ),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        printSchemaWithDirectives(schema)
      )
    }
  }
}
