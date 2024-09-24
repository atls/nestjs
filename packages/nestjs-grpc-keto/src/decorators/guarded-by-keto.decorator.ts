import type { GuardedByKetoFunction } from './guarded-by-keto.interfaces.js'

import { SetMetadata }                from '@nestjs/common'

import { GUARDED_BY_METADATA_KEY }    from './guarded-by-keto.constants.js'

export const GuardedByKeto: GuardedByKetoFunction = (relationTuple) =>
  SetMetadata(GUARDED_BY_METADATA_KEY, relationTuple)
