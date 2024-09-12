/* eslint-disable no-param-reassign */

export const OrderResultByKey = (key = 'id', defaultValue = undefined) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value

    // eslint-disable-next-line func-names
    descriptor.value = async function (keys, ...args) {
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
    }

    return descriptor
  }
