export const OrderResultByKey = function(key = 'id', defaultValue = undefined) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value

    descriptor.value = async function(keys, ...args) {
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

        return keys.map(itemKey => resultByKey[itemKey] || defaultValue)
      } catch (error) {
        throw error
      }
    }

    return descriptor
  }
}
