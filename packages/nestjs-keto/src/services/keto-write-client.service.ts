import type { RelationshipPatchActionEnum }               from '@ory/keto-client'
import type { RelationshipApiPatchRelationshipsRequest }  from '@ory/keto-client'
import type { RelationshipApiDeleteRelationshipsRequest } from '@ory/keto-client'
import type { Relationship }                              from '@ory/keto-client'
import type { RelationshipApiCreateRelationshipRequest }  from '@ory/keto-client'

import type { RelationShipTuple }                         from '../module/index.js'

import { Inject }                                         from '@nestjs/common'
import { Injectable }                                     from '@nestjs/common'

import { KetoGeneralException }                           from '../exceptions/index.js'
import { KETO_RELATIONS }                                 from '../module/index.js'
import { KetoRelationsService }                           from './keto-relations.service.js'

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
