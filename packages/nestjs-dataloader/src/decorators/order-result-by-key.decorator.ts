/* eslint-disable no-param-reassign */

export const OrderResultByKey = (key = 'id', defaultValue = undefined) =>
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const original = descriptor.value

    // @ts-expect-error unsafe assign
    // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
    descriptor.value = async function (keys, ...args): Promise<any> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const method = original.bind(this)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await method(keys, ...args)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const resultByKey = result.reduce(
        // @ts-expect-error unsafe method
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (res, item) => ({
          ...res,
          [item[key]]: item,
        }),
        {}
      )

      // @ts-expect-error unsafe method
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return keys.map((itemKey) => resultByKey[itemKey] || defaultValue)
    }

    return descriptor
  }
