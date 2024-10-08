type ScalarMap = Map<string, string>

const SCALARS: ScalarMap = new Map([
  ['bool', 'Boolean'],
  ['bytes', 'Byte'],
  ['double', 'Float'],
  ['fixed32', 'Int'],
  ['fixed64', 'BigInt'],
  ['float', 'Float'],
  ['int32', 'Int'],
  ['int64', 'BigInt'],
  ['sfixed32', 'Int'],
  ['sfixed64', 'BigInt'],
  ['sint32', 'Int'],
  ['sint64', 'BigInt'],
  ['string', 'String'],
  ['uint32', 'UnsignedInt'],
  ['uint64', 'BigInt'], // A new scalar might be needed
])

export function isScalarType(type: string): boolean {
  return SCALARS.has(type)
}

export function getGraphQLScalar(scalarType: string): string {
  const gqlScalar = SCALARS.get(scalarType)
  if (!gqlScalar) {
    throw new Error(`Could not find GraphQL Scalar for type ${scalarType}`)
  }
  // @ts-expect-error
  return SCALARS.get(scalarType)
}
