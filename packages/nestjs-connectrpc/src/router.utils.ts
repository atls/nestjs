import type { ServiceType }         from '@bufbuild/protobuf'
import type { ConnectRouter }       from '@connectrpc/connect'
import type { ServiceImpl }         from '@connectrpc/connect'
import type { MessageHandler }      from '@nestjs/microservices'
import type { Observable }          from 'rxjs'

import type { ConnectRpcPattern }   from './connectrpc.interfaces.js'
import type { CustomMetadataStore } from './custom-metadata.storage.js'

import { lastValueFrom }            from 'rxjs'

import { MethodType }               from './connectrpc.interfaces.js'
import { toAsyncGenerator }         from './async.utils.js'
import { transformToObservable }    from './async.utils.js'

export const createPattern = (service: string, methodName: string, streaming: MethodType): string =>
  JSON.stringify({
    service,
    rpc: methodName,
    streaming,
  } as ConnectRpcPattern)

export const addServicesToRouter = (
  router: ConnectRouter,
  serviceHandlersMap: Record<string, Partial<ServiceImpl<ServiceType>>>,
  customMetadataStore: CustomMetadataStore
): void => {
  Object.keys(serviceHandlersMap).forEach((serviceName) => {
    const service = customMetadataStore.get(serviceName)
    if (service) {
      router.service(service, serviceHandlersMap[serviceName])
    }
  })
}

export const createServiceHandlersMap = (
  handlers: Map<string, MessageHandler>,
  customMetadataStore: CustomMetadataStore
): Record<string, Partial<ServiceImpl<ServiceType>>> => {
  const serviceHandlersMap: Record<string, Partial<ServiceImpl<ServiceType>>> = {}

  handlers.forEach((handlerMetadata, pattern) => {
    const parsedPattern = JSON.parse(pattern)

    if (handlerMetadata) {
      const service = customMetadataStore.get(parsedPattern.service as string)
      const methodProto = service?.methods[parsedPattern.rpc]

      if (service && methodProto) {
        if (!serviceHandlersMap[parsedPattern.service]) {
          serviceHandlersMap[parsedPattern.service] = {}
        }

        switch (parsedPattern.streaming) {
          case MethodType.NO_STREAMING: {
            serviceHandlersMap[parsedPattern.service][parsedPattern.rpc] = async (
              request: unknown,
              context: unknown
            ): Promise<any> => {
              const result = handlerMetadata(request, context)
              const resultOrDeferred = await result
              return lastValueFrom(transformToObservable(resultOrDeferred))
            }
            break
          }
          case MethodType.RX_STREAMING: {
            serviceHandlersMap[parsedPattern.service][parsedPattern.rpc] =
              async function* rxStreamingHandler(
                request: unknown,
                context: unknown
              ): AsyncGenerator {
                const result = handlerMetadata(request, context)
                const streamOrValue = await result
                yield* toAsyncGenerator<unknown>(
                  streamOrValue as AsyncGenerator | Observable<unknown>
                )
              }
            break
          }
          default: {
            throw new Error('Invalid streaming type')
          }
        }
      }
    }
  })

  return serviceHandlersMap
}

export const createConnectRpcMethodMetadata = (
  target: object,
  key: string | symbol,
  service: string | undefined,
  method: string | undefined,
  streaming = MethodType.NO_STREAMING
): {
  service: string
  rpc: string | undefined
  streaming: MethodType
} => {
  const capitalizeFirstLetter = (input: string): string =>
    input.charAt(0).toUpperCase() + input.slice(1)

  if (!service) {
    const { name } = target.constructor
    return {
      service: name,
      rpc: capitalizeFirstLetter(key as string),
      streaming,
    }
  }
  if (service && !method) {
    return { service, rpc: capitalizeFirstLetter(key as string), streaming }
  }
  return { service, rpc: method, streaming }
}
