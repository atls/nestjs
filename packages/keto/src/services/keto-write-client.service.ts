import { Inject }                                    from '@nestjs/common'
import { Injectable }                                from '@nestjs/common'
import { RelationshipPatchActionEnum }               from '@ory/keto-client'
import { RelationshipApiPatchRelationshipsRequest }  from '@ory/keto-client'
import { RelationshipApiDeleteRelationshipsRequest } from '@ory/keto-client'
import { Relationship }                              from '@ory/keto-client'
import { RelationshipApiCreateRelationshipRequest }  from '@ory/keto-client'

import { KetoGeneralException }                      from '../exceptions'
import { RelationShipTuple }                         from '../module'
import { KETO_RELATIONS }                            from '../module'
import { KetoRelationsService }                      from './keto-relations.service'

@Injectable()
export class KetoWriteClientService {
  constructor(
    @Inject(KETO_RELATIONS)
    private readonly relationsService: KetoRelationsService
  ) {}

  async addRelationTuple(tuple: RelationShipTuple): Promise<Relationship> {
    try {
      const data: RelationshipApiCreateRelationshipRequest = {
        createRelationshipBody: tuple,
      }
      const response = await this.relationsService.createRelationship(data)

      return response.data
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  async removeRelationTuple(tuple: RelationShipTuple): Promise<boolean> {
    try {
      const data: RelationshipApiDeleteRelationshipsRequest = tuple

      await this.relationsService.deleteRelationships(data)

      return true
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }

  async patchRelationTuple(
    tuple: RelationShipTuple,
    action: RelationshipPatchActionEnum
  ): Promise<boolean> {
    try {
      const data: RelationshipApiPatchRelationshipsRequest = {
        relationshipPatch: [
          {
            action,
            relation_tuple: tuple,
          },
        ],
      }

      await this.relationsService.patchRelationships(data)

      return true
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }
}
