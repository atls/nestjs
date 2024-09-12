import { GUARDED_BY_METADATA_KEY }  from './guarded-by-keto.constants'
import { ReplaceGenerator }         from './guarded-by-keto.interfaces'
import { GetGuardingRelationTuple } from './guarded-by-keto.interfaces'

export const getGuardingRelationTuple: GetGuardingRelationTuple = (reflector, handler) =>
  reflector.get<string | ReplaceGenerator, typeof GUARDED_BY_METADATA_KEY>(
    GUARDED_BY_METADATA_KEY,
    handler
  ) ?? null
