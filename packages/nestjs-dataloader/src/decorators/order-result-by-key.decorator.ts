/* eslint-disable no-param-reassign */

type OrderableItem = Record<PropertyKey, unknown>

export const OrderResultByKey = (key: PropertyKey = 'id', defaultValue?: OrderableItem) =>
  (target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const original = descriptor.value

    const orderedResolver = async function orderResultByKeyResolver(
      this: unknown,
      keys: Array<PropertyKey>,
      ...args: Array<unknown>
    ): Promise<Array<unknown>> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const method = original.bind(this)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = (await method(keys, ...args)) as Array<OrderableItem>

      const resultByKey = result.reduce<Record<PropertyKey, OrderableItem>>(
        (res, item) => ({
          ...res,
          [item[key] as PropertyKey]: item,
        }),
        {}
      )

      return keys.map((itemKey) => resultByKey[itemKey] ?? defaultValue)
    }

    descriptor.value = orderedResolver

    return descriptor
  }
