import type { CustomDecorator } from '@nestjs/common'
import type { Reflector }       from '@nestjs/core'

export type GetGuardingRelationTuple = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1]
) => ReplaceGenerator | string | undefined

export type ReplaceGenerator = (value: string) => string

export type GuardedByKetoFunction = (
  relationTuple: ReplaceGenerator | string
) => CustomDecorator<symbol>
