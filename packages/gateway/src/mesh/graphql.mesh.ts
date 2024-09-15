// @ts-ignore
import { MeshInstance }      from '@graphql-mesh/runtime'
import { Injectable }        from '@nestjs/common'
// @ts-ignore
import { getMesh }           from '@graphql-mesh/runtime'

import { GraphQLMeshConfig } from './graphql-mesh.config.js'

@Injectable()
export class GraphQLMesh {
  private mesh!: MeshInstance

  constructor(private readonly config: GraphQLMeshConfig) {}

  async getInstance() {
    if (!this.mesh) {
      this.mesh = await getMesh(await this.config.create())
    }

    return this.mesh
  }
}
