type OrderKey = number | string | symbol

const normalizeKey = (value: unknown): string | undefined => {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value)
  }
  if (typeof value === 'symbol') {
    return value.toString()
  }
  return undefined
}

export const OrderResultByKey = (key = 'id', defaultValue: unknown = undefined) =>
  (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const original = descriptor.value as (
      keys: Array<OrderKey>,
      ...args: Array<unknown>
    ) => Promise<Array<Record<OrderKey, unknown>>>

    // eslint-disable-next-line func-names
    descriptor.value = async function (
      keys: Array<OrderKey>,
      ...args: Array<unknown>
    ): Promise<Array<unknown>> {
      const method = original.bind(this)
      const result = await method(keys, ...args)

      const resultByKey = result.reduce<Record<string, Record<OrderKey, unknown>>>((res, item) => {
        const itemKey = item[key]
        const normalizedKey = normalizeKey(itemKey)
        if (normalizedKey !== undefined) {
          res[normalizedKey] = item
        }
        return res
      }, {})

      return keys.map((itemKey) => {
        const normalizedKey = normalizeKey(itemKey)
        if (normalizedKey === undefined) {
          return defaultValue
        }
        return resultByKey[normalizedKey] ?? defaultValue
      })
    }

    return descriptor
  }
