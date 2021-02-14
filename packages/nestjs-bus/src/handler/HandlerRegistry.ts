import { HandlerRegistration }                         from '@node-ts/bus-core'
import { Handler, MessageType }                        from '@node-ts/bus-core/dist/handler/handler'
import {
  ClassConstructor,
  isClassConstructor as isCC,
} from '@node-ts/bus-core/dist/util/class-constructor'
import { Message }                                     from '@node-ts/bus-messages'
import { LOGGER_SYMBOLS, Logger }                      from '@node-ts/logger-core'
import { Container, decorate, injectable, interfaces } from 'inversify'
import { serializeError }                              from 'serialize-error'

import { Inject }                                      from '@nestjs/common'
import { ModuleRef }                                   from '@nestjs/core'

export type HandlerType =
  | ClassConstructor<Handler<Message>>
  | ((context: interfaces.Context) => Handler<Message>)

export type HandlerDetails = {
  symbol: symbol
  handler: HandlerType
}

export type MessageRegistryEntry = {
  messageType: MessageType
  handlers: Array<HandlerDetails>
}

function getHandlerName(handler: any): string {
  return isCC(handler) ? handler.prototype.constructor.name : handler.constructor.name
}

@injectable()
export class HandlerRegistry {
  private container: any

  private registry: { [key: string]: MessageRegistryEntry } = {}

  private unhandledMessages: string[] = []

  constructor(
    @Inject(LOGGER_SYMBOLS.Logger)
    private readonly logger: Logger,
    private readonly moduleRef: ModuleRef
  ) {}

  register<TMessage extends MessageType = MessageType>(
    messageName: string,
    symbol: symbol,
    handler: HandlerType,
    messageType?: ClassConstructor<TMessage>
  ): void {
    if (!this.registry[messageName]) {
      this.registry[messageName] = {
        messageType,
        handlers: [],
      }
    }

    const handlerName = getHandlerName(handler)
    const handlerAlreadyRegistered = this.registry[messageName].handlers.some(
      f => f.symbol === symbol
    )

    if (handlerAlreadyRegistered) {
      this.logger.warn("Attempted to re-register a handler that's already registered", {
        handlerName,
      })
      return
    }

    if (isCC(handler)) {
      const allRegisteredHandlers = [...Object.values(this.registry)].flatMap(
        message => message.handlers
      )
      const handlerNameAlreadyRegistered = allRegisteredHandlers.some(
        f => f.handler.name === handler.name
      )

      if (handlerNameAlreadyRegistered) {
        throw new Error(
          'Attempted to register a handler, when a handler with the same name has already been registered. ' +
            `Handlers must be registered with a unique name - "${handler.name}"`
        )
      }

      try {
        decorate(injectable(), handler)
        this.logger.trace(
          `Handler "${handler.name}" was missing the "injectable()" decorator. ` +
            'This has been added automatically'
        )
        // eslint-disable-next-line
      } catch (_a) {}
    }

    const handlerDetails = {
      symbol,
      handler,
    }
    this.registry[messageName].handlers.push(handlerDetails)
    this.logger.info('Handler registered', {
      messageType: messageName,
      handler: handlerName,
    })
  }

  get<TMessage extends MessageType>(messageName: string): HandlerRegistration<TMessage>[] {
    if (!(messageName in this.registry)) {
      if (!this.unhandledMessages.some(m => m === messageName)) {
        this.unhandledMessages.push(messageName)
        this.logger.warn(
          `No handlers were registered for message "${messageName}". ` +
            "This could mean that either the handlers haven't been registered with bootstrap.registerHandler(), " +
            "or that the underlying transport is subscribed to messages that aren't handled and should be removed."
        )
      }
      return []
    }
    return this.registry[messageName].handlers.map(h => ({
      defaultContainer: this.container,
      resolveHandler: container => {
        this.logger.debug(`Resolving handlers for ${messageName}.`, {
          receivedMessage: messageName,
        })
        let handler = null
        try {
          handler = this.moduleRef.get(h.handler as ClassConstructor<Handler<Message>>, {
            strict: false,
          })
          // eslint-disable-next-line
        } catch (error) {}
        if (handler) {
          return handler
        }
        try {
          return container.get(h.symbol)
        } catch (error) {
          this.logger.error('Could not resolve handler from the IoC container.', {
            receivedMessage: messageName,
            error: serializeError(error),
          })
          throw error
        }
      },
    }))
  }

  bindHandlersToContainer(container: Container): void {
    this.container = container
    this.bindHandlers()
  }

  getHandlerId(handler: Handler<Message>): string {
    return handler.constructor.name
  }

  getMessageNames() {
    return Object.keys(this.registry)
  }

  getMessageConstructor(messageName) {
    if (!(messageName in this.registry)) {
      return undefined
    }
    return this.registry[messageName].messageType
  }

  private bindHandlers() {
    Object.entries(this.registry).forEach(([messageName, messageHandler]) => {
      messageHandler.handlers.forEach(handlerRegistration => {
        const handlerName = getHandlerName(handlerRegistration.handler)
        this.logger.debug('Binding handler to message', {
          messageName,
          handlerName,
        })

        if (isCC(handlerRegistration.handler)) {
          this.container
            .bind(handlerRegistration.symbol)
            .to(handlerRegistration.handler)
            .inTransientScope()
        } else {
          this.container
            .bind(handlerRegistration.symbol)
            .toDynamicValue(handlerRegistration.handler)
            .inTransientScope()
        }
      })
    })
  }
}
