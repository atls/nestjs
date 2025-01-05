import type { ServiceType }         from '@bufbuild/protobuf'
import type { ConnectRouter }       from '@connectrpc/connect'
import type { ServiceImpl }         from '@connectrpc/connect'
import type { MessageHandler }      from '@nestjs/microservices'
import type { Observable }          from 'rxjs'

import type { ConnectRpcPattern }   from '../connectrpc.interfaces.js'
import type { CustomMetadataStore } from '../custom-metadata.storage.js'

import { lastValueFrom }            from 'rxjs'

import { MethodType }               from '../connectrpc.interfaces.js'
import { toAsyncGenerator }         from './async.utils.js'
import { transformToObservable }    from './async.utils.js'

/**
 * Creates a JSON string pattern for a given service, method, and streaming type.
 * @param {string} service - The name of the service.
 * @param {string} methodName - The name of the method to call.
 * @param {MethodType} streaming - The streaming type (NO_STREAMING or RX_STREAMING).
 * @returns {string} - The JSON string pattern for the RPC method.
 */
export const createPattern = (service: string, methodName: string, streaming: MethodType): string =>
  JSON.stringify({ service, rpc: methodName, streaming } as ConnectRpcPattern)

/**
 * Registers services and their handlers to the provided ConnectRouter instance.
 * @param {ConnectRouter} router - The ConnectRouter instance to configure.
 * @param {Record<string, Partial<ServiceImpl<ServiceType>>>} serviceHandlersMap -
 *        A map of services and their respective handler implementations.
 * @param {CustomMetadataStore} customMetadataStore - The metadata store containing service configurations.
 */
export const addServicesToRouter = (
  router: ConnectRouter,
  serviceHandlersMap: Record<string, Partial<ServiceImpl<ServiceType>>>,
  customMetadataStore: CustomMetadataStore
): void => {
  for (const serviceName of Object.keys(serviceHandlersMap)) {
    const service = customMetadataStore.get(serviceName)
    // eslint-disable-next-line no-continue
    if (!service) continue
    router.service(service, serviceHandlersMap[serviceName])
  }
}

/**
 * Generates a map of service handlers with support for synchronous and asynchronous streaming.
 * @param {Map<string, MessageHandler>} handlers - The map of message patterns to their respective handlers.
 * @param {CustomMetadataStore} customMetadataStore - The metadata store with service configurations.
 * @returns {Record<string, Partial<ServiceImpl<ServiceType>>>} - A map of service names to their handlers.
 */
export const createServiceHandlersMap = (
  handlers: Map<string, MessageHandler>,
  customMetadataStore: CustomMetadataStore
): Record<string, Partial<ServiceImpl<ServiceType>>> => {
  const serviceHandlersMap: Record<string, Partial<ServiceImpl<ServiceType>>> = {}

  handlers.forEach((handlerMetadata, pattern) => {
    const parsedPattern = JSON.parse(pattern) as ConnectRpcPattern
    const { service, rpc, streaming } = parsedPattern
    const serviceMetadata = customMetadataStore.get(service)

    if (!serviceMetadata) return
    const methodProto = serviceMetadata.methods[rpc]
    if (!methodProto) return
    serviceHandlersMap[service] ??= {}

    switch (streaming) {
      case MethodType.NO_STREAMING:
        serviceHandlersMap[service][rpc] = async (
          request: unknown,
          context: unknown
        ): Promise<unknown> => {
          const resultOrDeferred = await handlerMetadata(request, context)
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return lastValueFrom(transformToObservable(resultOrDeferred))
        }
        break

      case MethodType.RX_STREAMING:
        serviceHandlersMap[service][rpc] = async function* handleStream(
          request: unknown,
          context: unknown
        ): AsyncGenerator {
          const streamOrValue = await handlerMetadata(request, context)
          yield* toAsyncGenerator(streamOrValue as AsyncGenerator | Observable<unknown>)
        }
        break

      default:
        throw new Error(`Unsupported streaming type: ${streaming as string}`)
    }
  })

  return serviceHandlersMap
}

/**
 * Creates metadata for a Connect RPC method, setting defaults when necessary.
 * @param {object} target - The target object (usually a service class) for metadata association.
 * @param {string | symbol} key - The name of the method or property.
 * @param {string} [service] - Optional service name, defaults to the class name of the target.
 * @param {string} [method] - Optional method name; defaults to the capitalized key name.
 * @param {MethodType} [streaming=MethodType.NO_STREAMING] - The streaming type, defaulting to NO_STREAMING.
 * @returns {{ service: string; rpc: string; streaming: MethodType }} - Metadata with service, RPC method, and streaming type.
 */
export const createConnectRpcMethodMetadata = (
  target: object,
  key: string | symbol,
  service?: string,
  method?: string,
  streaming: MethodType = MethodType.NO_STREAMING
): { service: string; rpc: string; streaming: MethodType } => {
  const capitalizeFirstLetter = (input: string): string =>
    input.charAt(0).toUpperCase() + input.slice(1)

  const serviceName = service ?? target.constructor.name
  const rpcMethodName = method ?? capitalizeFirstLetter(String(key))

  return { service: serviceName, rpc: rpcMethodName, streaming }
}
