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

function isFunctionPropertyDescriptor(
  descriptor: PropertyDescriptor | undefined
): descriptor is FunctionPropertyDescriptor {
  return descriptor !== undefined && typeof descriptor.value === 'function'
}

export const ConnectRpcService = (serviceName: ServiceType): ClassDecorator =>
  (target: ConstructorWithPrototype): void => {
    const processMethodKey = (methodImpl: MethodKey): void => {
      const functionName = methodImpl.key
      const { methodType } = methodImpl

      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, functionName)

      if (isFunctionPropertyDescriptor(descriptor)) {
        const metadata = createConnectRpcMethodMetadata(
          descriptor.value,
          functionName,
          serviceName.typeName,
          functionName,
          methodType
        )

        const customMetadataStore = CustomMetadataStore.getInstance()
        customMetadataStore.set(serviceName.typeName, serviceName)

        MessagePattern(metadata, CONNECTRPC_TRANSPORT)(target.prototype, functionName, descriptor)
      }
    }

    const unaryMethodKeys: MethodKeys = Reflect.getMetadata(METHOD_DECORATOR_KEY, target) || []
    const streamMethodKeys: MethodKeys =
      Reflect.getMetadata(STREAM_METHOD_DECORATOR_KEY, target) || []

    unaryMethodKeys.forEach((methodImpl) => {
      processMethodKey(methodImpl)
    })
    streamMethodKeys.forEach((methodImpl) => {
      processMethodKey(methodImpl)
    })
  }

export const ConnectRpcMethod = (): MethodDecorator => (target: object, key: string | symbol) => {
  const metadata: MethodKey = {
    key: key.toString(),
    methodType: MethodType.NO_STREAMING,
  }

  const existingMethods: Set<MethodKey> =
    Reflect.getMetadata(METHOD_DECORATOR_KEY, target.constructor) || new Set()

  if (!existingMethods.has(metadata)) {
    existingMethods.add(metadata)
    Reflect.defineMetadata(METHOD_DECORATOR_KEY, existingMethods, target.constructor)
  }
}

export const ConnectRpcStreamMethod = (): MethodDecorator =>
  (target: object, key: string | symbol) => {
    const metadata: MethodKey = {
      key: key.toString(),
      methodType: MethodType.RX_STREAMING,
    }

    const existingMethods: Set<MethodKey> =
      Reflect.getMetadata(STREAM_METHOD_DECORATOR_KEY, target.constructor) || new Set()

    if (!existingMethods.has(metadata)) {
      existingMethods.add(metadata)
      Reflect.defineMetadata(STREAM_METHOD_DECORATOR_KEY, existingMethods, target.constructor)
    }
  }
