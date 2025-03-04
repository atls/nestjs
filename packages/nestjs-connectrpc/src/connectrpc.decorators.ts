import type { ServiceType }                from '@bufbuild/protobuf'

import type { ConstructorWithPrototype }   from './connectrpc.interfaces.js'
import type { FunctionPropertyDescriptor } from './connectrpc.interfaces.js'
import type { MethodKey }                  from './connectrpc.interfaces.js'
import type { MethodKeys }                 from './connectrpc.interfaces.js'

import { MessagePattern }                  from '@nestjs/microservices'

import { CONNECTRPC_TRANSPORT }            from './connectrpc.constants.js'
import { METHOD_DECORATOR_KEY }            from './connectrpc.constants.js'
import { STREAM_METHOD_DECORATOR_KEY }     from './connectrpc.constants.js'
import { MethodType }                      from './connectrpc.interfaces.js'
import { CustomMetadataStore }             from './custom-metadata.storage.js'
import { createConnectRpcMethodMetadata }  from './utils/router.utils.js'

/**
 * Type guard to check if a given descriptor is a function property descriptor.
 * @param {PropertyDescriptor | undefined} descriptor - The descriptor to check.
 * @returns {descriptor is FunctionPropertyDescriptor} - True if descriptor is for a function.
 */
function isFunctionPropertyDescriptor(
  descriptor: PropertyDescriptor | undefined
): descriptor is FunctionPropertyDescriptor {
  return descriptor !== undefined && typeof descriptor.value === 'function'
}

/**
 * ConnectRpcService decorator to register RPC services and their handlers.
 * @param {ServiceType} serviceName - The service type from protobuf.
 * @returns {ClassDecorator} - Class decorator function.
 */
export const ConnectRpcService = (serviceName: ServiceType): ClassDecorator =>
  (target: ConstructorWithPrototype): void => {
    // Получаем все зарегистрированные методы и объединяем их
    const unaryMethodKeys: MethodKeys = Reflect.getMetadata(METHOD_DECORATOR_KEY, target) || []
    const streamMethodKeys: MethodKeys =
      Reflect.getMetadata(STREAM_METHOD_DECORATOR_KEY, target) || []
    const allMethodKeys = [...unaryMethodKeys, ...streamMethodKeys] as Array<MethodKey>

    allMethodKeys.forEach((methodImpl) => {
      const { key: functionName, methodType } = methodImpl
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, functionName)

      if (!descriptor || !isFunctionPropertyDescriptor(descriptor)) return

      const metadata = createConnectRpcMethodMetadata(
        descriptor.value,
        functionName,
        serviceName.typeName,
        functionName,
        methodType
      )

      CustomMetadataStore.getInstance().set(serviceName.typeName, serviceName)
      MessagePattern(metadata, CONNECTRPC_TRANSPORT)(target.prototype, functionName, descriptor)
    })
  }

export const AddMethodMetadata = (
  target: object,
  key: string | symbol,
  methodType: MethodType,
  metadataKey: string | symbol
): void => {
  const metadata: MethodKey = {
    key: key.toString(),
    methodType,
  }

  const existingMethods =
    (Reflect.getMetadata(metadataKey, target.constructor) as Set<MethodKey>) || new Set()

  if (existingMethods.has(metadata)) return

  existingMethods.add(metadata)
  Reflect.defineMetadata(metadataKey, existingMethods, target.constructor)
}

/**
 * Decorator for unary RPC methods.
 * Registers the method as a unary RPC with no streaming.
 * @returns {MethodDecorator} - Method decorator function.
 */
export const ConnectRpcMethod = (): MethodDecorator => (target: object, key: string | symbol) => {
  AddMethodMetadata(target, key, MethodType.NO_STREAMING, METHOD_DECORATOR_KEY)
}

/**
 * Decorator for streaming RPC methods.
 * Registers the method as a streaming RPC with RX_STREAMING type.
 * @returns {MethodDecorator} - Method decorator function.
 */
export const ConnectRpcStreamMethod = (): MethodDecorator =>
  (target: object, key: string | symbol) => {
    AddMethodMetadata(target, key, MethodType.RX_STREAMING, STREAM_METHOD_DECORATOR_KEY)
  }
