import { CustomDecorator } from '@nestjs/common'
import { Reflector }       from '@nestjs/core'

export type GetGuardingRelationTuple = (
  reflector: Reflector,
  handler: Parameters<Reflector['get']>[1]
) => string | ReplaceGenerator

export type ReplaceGenerator = (value: string) => string

export type GuardedByKetoFunction = (
  relationTuple: string | ReplaceGenerator
) => CustomDecorator<symbol>
