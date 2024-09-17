import { Inject }                              from '@nestjs/common'
import { Injectable }                          from '@nestjs/common'
import { PermissionApiCheckPermissionRequest } from '@ory/keto-client'

import { KetoGeneralException }                from '../exceptions/index.js'
import { RelationShipTupleWithId }             from '../module/index.js'
import { RelationShipTupleWithSet }            from '../module/index.js'
import { RelationShipTuple }                   from '../module/index.js'
import { KETO_PERMISSIONS }                    from '../module/index.js'
import { KetoPermissionsService }              from './keto-permissions.service.js'

@Injectable()
export class KetoReadClientService {
  constructor(
    @Inject(KETO_PERMISSIONS) private readonly permissionService: KetoPermissionsService
  ) {}

  async validateRelationTuple(request: RelationShipTuple): Promise<boolean> {
    try {
      let data: PermissionApiCheckPermissionRequest

      // @ts-ignore
      if (request.subject_id !== undefined) {
        // @ts-ignore
        const req: RelationShipTupleWithId = request

        data = {
          relation: req.relation,
          object: req.object,
          namespace: req.namespace,
          subjectId: req.subject_id,
        }
      } else {
        // @ts-ignore
        const req: RelationShipTupleWithSet = request

        data = {
          relation: req.relation,
          object: req.object,
          namespace: req.namespace,
          subjectSetNamespace: req.subject_set.namespace,
          subjectSetObject: req.subject_set.object,
          subjectSetRelation: req.subject_set.relation,
        }
      }

      const response = await this.permissionService.checkPermissionOrError(data)

      return response.data.allowed
    } catch (error) {
      throw new KetoGeneralException((error as Error).toString())
    }
  }
}
