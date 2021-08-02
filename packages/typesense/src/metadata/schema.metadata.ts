export interface SchemaField {
  name: string
  type: string
  facet?: boolean
  index?: boolean
  optional?: boolean
}

export interface Schema {
  name: string
  defaultSortingField: string
  fields: Array<SchemaField>
}
