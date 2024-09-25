import type { Type }                    from '@nestjs/common/interfaces'
import type { ModuleMetadata }          from '@nestjs/common/interfaces'
import type { ConfigurationParameters } from '@ory/keto-client'
import type { SubjectSet }              from '@ory/keto-client'

export interface KetoModuleOptions extends ConfigurationParameters {
  global?: boolean
}

export interface KetoOptionsFactory {
  createKetoOptions: () => KetoModuleOptions | Promise<KetoModuleOptions>
}

export interface KetoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KetoOptionsFactory>
  useClass?: Type<KetoOptionsFactory>
  useFactory?: (...args: Array<any>) => KetoModuleOptions | Promise<KetoModuleOptions>
  inject?: Array<any>
  global?: boolean
}

export type RelationShipTuple = RelationShipTupleWithId | RelationShipTupleWithSet

export type RelationShipTupleWithId = {
  namespace: string
  object: string
  relation: string
  subject_id: string
}

export type RelationShipTupleWithSet = {
  namespace: string
  object: string
  relation: string
  subject_set: SubjectSet
}
