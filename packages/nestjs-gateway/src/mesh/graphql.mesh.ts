// @ts-expect-error
import type { MeshInstance } from '@graphql-mesh/runtime'

import { Injectable }        from '@nestjs/common'
// @ts-expect-error
import { getMesh }           from '@graphql-mesh/runtime'

import { GraphQLMeshConfig } from './graphql-mesh.config.js'

@Injectable()
export class GraphQLMesh {
  private mesh!: MeshInstance

  constructor(private readonly config: GraphQLMeshConfig) {}

  async getInstance(): Promise<MeshInstance> {
    if (!this.mesh) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      this.mesh = await getMesh(await this.config.create())
    }

    return this.mesh
  }
}
