/* eslint prettier/prettier: 0 */

import { HandlerRegistration, HandlerResolver }        from '@node-ts/bus-core'
import { Handler, MessageType }                        from '@node-ts/bus-core/dist/handler/handler'
import {
  ClassConstructor,
  isClassConstructor as isCC,
} from '@node-ts/bus-core/dist/util/class-constructor'
import { LOGGER_SYMBOLS, Logger }                      from '@node-ts/logger-core'
import { Container, decorate, injectable, interfaces } from 'inversify'
import { serializeError }                              from 'serialize-error'

import { Inject }                                      from '@nestjs/common'
import { ModuleRef }                                   from '@nestjs/core'
import { Message }                                     from '@node-ts/bus-messages'

export type HandlerType =
  | ClassConstructor<Handler<Message>>
  | ((context: interfaces.Context) => Handler<Message>)

function getHandlerName(handler: any) {
  return isCC(handler) ? handler.prototype.constructor.name : handler.constructor.name
}

@injectable()
export class HandlerRegistry {
  private container: any

  private handlerResolvers: any[] = []

  constructor(
    @Inject(LOGGER_SYMBOLS.Logger)
    private readonly logger: Logger,
    private readonly moduleRef: ModuleRef
  ) {}

  register<TMessage extends MessageType = MessageType>(
    resolver: (message: TMessage) => boolean,
    symbol: symbol,
    handler: HandlerType,
    messageType?: ClassConstructor<Message>,
    topicIdentifier?: string
  ): void {
    const handlerName = getHandlerName(handler)
    const handlerAlreadyRegistered = this.handlerResolvers.some((f: any) => f.symbol === symbol)

    if (handlerAlreadyRegistered) {
      this.logger.warn("Attempted to re-register a handler that's already registered", {
        handlerName,
      })
      return
    }

    if (isCC(handler)) {
      try {
        decorate(injectable(), handler)
        this.logger.trace(
          `Handler "${handler.name}" was missing the "injectable()" decorator. ` +
            'This has been added automatically'
        )
        // eslint-disable-next-line
      } catch (_a) {}
    }

    this.handlerResolvers.push({
      messageType,
      resolver,
      symbol,
      handler,
      topicIdentifier,
    })
    this.logger.info('Handler registered', {
      messageName: messageType ? messageType.name : undefined,
      handler: handlerName,
    })
  }

  get<TMessage extends MessageType>(message: TMessage): HandlerRegistration<TMessage>[] {
    const resolvedHandlers = this.handlerResolvers.filter(resolvers => resolvers.resolver(message))
    if (resolvedHandlers.length === 0) {
      this.logger.warn(
        'No handlers were registered for message. ' +
          "This could mean that either the handlers haven't been registered with bootstrap.registerHandler(), " +
          "or that the underlying transport is subscribed to messages that aren't handled and should be removed.",
        { receivedMessage: message }
      )
      return []
    }
    return resolvedHandlers.map(h => ({
      defaultContainer: this.container,
      resolveHandler: container => {
        this.logger.debug('Resolving handlers for message.', {
          receivedMessage: message,
        })
        let handler = null
        try {
          handler = this.moduleRef.get(h.handler, {
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
            receivedMessage: message,
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

  get messageSubscriptions(): HandlerResolver[] {
    return this.handlerResolvers
  }

  private bindHandlers() {
    this.handlerResolvers.forEach(handlerRegistration => {
      const handlerName = getHandlerName(handlerRegistration.handler)
      this.logger.debug('Binding handler to message', { handlerName })

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
  }
}
