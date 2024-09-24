import type { ReplaceGenerator }         from './guarded-by-keto.interfaces.js'
import type { GetGuardingRelationTuple } from './guarded-by-keto.interfaces.js'

import { GUARDED_BY_METADATA_KEY }       from './guarded-by-keto.constants.js'

export const getGuardingRelationTuple: GetGuardingRelationTuple = (reflector, handler) =>
  reflector.get<ReplaceGenerator | string, typeof GUARDED_BY_METADATA_KEY>(
    GUARDED_BY_METADATA_KEY,
    handler
  ) ?? null
