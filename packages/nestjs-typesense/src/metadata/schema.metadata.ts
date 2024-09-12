export interface SchemaField {
  type: string
  name: string
  facet?: boolean
  index?: boolean
  optional?: boolean
}

export interface Schema {
  name: string
  defaultSortingField: string
  fields: Array<SchemaField>
}
