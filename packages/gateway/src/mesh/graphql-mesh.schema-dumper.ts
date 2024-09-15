/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import { OnModuleInit }              from '@nestjs/common'
import { Injectable }                from '@nestjs/common'
import { printSchemaWithDirectives } from '@graphql-tools/utils'
import { promises as fs }            from 'fs'
import { join }                      from 'path'

import { GraphQLMesh }               from './graphql.mesh'

declare const __non_webpack_require__: any

@Injectable()
export class GraphQLMeshSchemaDumper implements OnModuleInit {
  constructor(private readonly mesh: GraphQLMesh) {}

  async onModuleInit() {
    if (process.env.NODE_ENV === 'development') {
      const { schema } = await this.mesh.getInstance()

      await fs.writeFile(
        join(
          typeof __non_webpack_require__ === 'undefined' ? process.cwd() : `${__dirname}/../`,
          'gateway.graphql'
        ),
        printSchemaWithDirectives(schema)
      )
    }
  }
}
