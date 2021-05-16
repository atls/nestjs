/* eslint-disable no-useless-catch */

export const OrderResultByKey =
  (key = 'id', defaultValue = undefined) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value

    // eslint-disable-next-line no-param-reassign
    descriptor.value = async (keys, ...args) => {
      try {
        const method = original.bind(this)
        const result = await method(keys, ...args)

        const resultByKey = result.reduce(
          (res, item) => ({
            ...res,
            [item[key]]: item,
          }),
          {}
        )

        return keys.map((itemKey) => resultByKey[itemKey] || defaultValue)
      } catch (error) {
        throw error
      }
    }

    return descriptor
  }
