import { SetMetadata }             from '@nestjs/common'

import { GUARDED_BY_METADATA_KEY } from './guarded-by-keto.constants.js'
import { GuardedByKetoFunction }   from './guarded-by-keto.interfaces.js'

// @ts-ignore
export const GuardedByKeto: GuardedByKetoFunction = (relationTuple) =>
  SetMetadata(GUARDED_BY_METADATA_KEY, relationTuple)