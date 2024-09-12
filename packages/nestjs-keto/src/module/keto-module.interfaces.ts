import { Type }                    from '@nestjs/common/interfaces'
import { ModuleMetadata }          from '@nestjs/common/interfaces'
import { ConfigurationParameters } from '@ory/keto-client'
import { SubjectSet }              from '@ory/keto-client'

export interface KetoModuleOptions extends ConfigurationParameters {
  global?: boolean
}

export interface KetoOptionsFactory {
  createKetoOptions(): Promise<KetoModuleOptions> | KetoModuleOptions
}

export interface KetoModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<KetoOptionsFactory>
  useClass?: Type<KetoOptionsFactory>
  useFactory?: (...args: any[]) => Promise<KetoModuleOptions> | KetoModuleOptions
  inject?: any[]
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
