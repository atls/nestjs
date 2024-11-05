import type { ConnectRouter }           from '@connectrpc/connect'
import type { CustomTransportStrategy } from '@nestjs/microservices'
import type { MessageHandler }          from '@nestjs/microservices'

import type { ServerTypeOptions }       from './connectrpc.interfaces.js'

import { Server }                       from '@nestjs/microservices'
import { isString }                     from '@nestjs/common/utils/shared.utils.js'

import { HTTPServer }                   from './connectrpc.server.js'
import { CustomMetadataStore }          from './custom-metadata.storage.js'
import { addServicesToRouter }          from './utils/router.utils.js'
import { createServiceHandlersMap }     from './utils/router.utils.js'

export class ConnectRpcServer extends Server implements CustomTransportStrategy {
  private readonly customMetadataStore: CustomMetadataStore | null = null

  private server: HTTPServer | null = null

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
      this.server = new HTTPServer(this.options, router)

      await this.server.listen()

      callback()
    } catch (error) {
      callback(error)
    }
  }

  public async close(): Promise<void> {
    await this.server?.close()
  }

  public override addHandler(
    pattern: unknown,
    callback: MessageHandler,
    isEventHandler = false
  ): void {
    const route = isString(pattern) ? pattern : JSON.stringify(pattern)
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
