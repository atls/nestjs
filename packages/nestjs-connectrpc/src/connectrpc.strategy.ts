import type { ConnectRouter }           from '@connectrpc/connect'
import type { CustomTransportStrategy } from '@nestjs/microservices'
import type { MessageHandler }          from '@nestjs/microservices'

import type { ServerTypeOptions }       from './connectrpc.interfaces.js'

import { Server }                       from '@nestjs/microservices'

import { HTTPServer }                   from './connectrpc.server.js'
import { CustomMetadataStore }          from './custom-metadata.storage.js'
import { addServicesToRouter }          from './utils/router.utils.js'
import { createServiceHandlersMap }     from './utils/router.utils.js'

export class ConnectRpcServer extends Server implements CustomTransportStrategy {
  private readonly customMetadataStore: CustomMetadataStore | null = null

  private server: HTTPServer | null = null

  private readonly listeners: Array<{ event: string; callback: Function }> = []

  private readonly options: ServerTypeOptions

  constructor(options: ServerTypeOptions) {
    super()
    this.customMetadataStore = CustomMetadataStore.getInstance()
    this.options = options
  }

  async listen(
    callback: (error?: unknown, ...optionalParameters: Array<unknown>) => void
  ): Promise<void> {
    try {
      const router = this.buildRouter()
      this.server = new HTTPServer(this.options, router, this.listeners)

      await this.server.listen()

      callback()
    } catch (error) {
      callback(error)
    }
  }

  public async close(): Promise<void> {
    await this.server?.close()
  }

  public on(event: string, callback: Function): void {
    this.listeners.push({ event, callback })
    const server = this.server?.server

    if (server) {
      server.on(event, callback as (...args: Array<unknown>) => void)
    }
  }

  public unwrap<T>(): T {
    const server = this.server?.server

    if (!server) {
      throw new Error('ConnectRPC server is not listening')
    }

    return server as T
  }

  public override addHandler(
    pattern: unknown,
    callback: MessageHandler,
    isEventHandler = false
  ): void {
    const route = typeof pattern === 'string' ? pattern : JSON.stringify(pattern)
    if (isEventHandler) {
      const modifiedCallback = callback
      modifiedCallback.isEventHandler = true
      this.messageHandlers.set(route, modifiedCallback)
      return
    }
    this.messageHandlers.set(route, callback)
  }

  buildRouter() {
    return (router: ConnectRouter): void => {
      if (!this.customMetadataStore) return
      const serviceHandlersMap = createServiceHandlersMap(
        this.getHandlers(),
        this.customMetadataStore
      )
      addServicesToRouter(router, serviceHandlersMap, this.customMetadataStore)
    }
  }
}
