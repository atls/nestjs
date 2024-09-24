/* eslint-disable no-param-reassign */

export const OrderResultByKey = (key = 'id', defaultValue = undefined) =>
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const original = descriptor.value

    // @ts-expect-error
    // eslint-disable-next-line func-names
    descriptor.value = async function (keys, ...args): Promise<any> {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const method = original.bind(this)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await method(keys, ...args)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const resultByKey = result.reduce(
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        (res, item) => ({
          ...res,
          [item[key]]: item,
        }),
        {}
      )

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return keys.map((itemKey) => resultByKey[itemKey] || defaultValue)
    }

    return descriptor
  }
