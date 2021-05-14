/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

import { HandlerRegistry }                    from '@node-ts/bus-core'
import { RabbitMqTransport as BaseTransport } from '@node-ts/bus-rabbitmq/dist/rabbitmq-transport'

export class RabbitMqTransport extends BaseTransport {
  // @ts-ignore
  async initialize(handlerRegistry: HandlerRegistry): Promise<void> {
    // @ts-ignore
    await super.initialize(handlerRegistry)

    const self: any = this as any

    self.connection.on('connect', async () => {
      try {
        await self.channel.waitForConnect()

        self.assertedExchanges = {}

        await self.bindExchangesToQueue(handlerRegistry)

        for (const message of self.channel._messages) {
          await self.assertExchange(message.exchange)
        }

        self.channel._startWorker()
      } catch (error) {
        console.log(error)
        self.logger.error('Rebind exchanges to queue error', error)
      }
    })
  }
}
