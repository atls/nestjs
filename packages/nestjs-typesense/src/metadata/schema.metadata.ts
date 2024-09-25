import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection.js'

export interface Schema {
  name: string
  defaultSortingField: string
  fields: Array<CollectionFieldSchema>
}
