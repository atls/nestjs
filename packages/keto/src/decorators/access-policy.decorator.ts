import { SetMetadata }            from '@nestjs/common'

import { ACCESS_POLICY_METADATA } from '../constants'

export const AccessPolicy = (flavor: string, resource: string, action: string) =>
  SetMetadata(ACCESS_POLICY_METADATA, { flavor, resource, action })
