import ConnectionManager  from 'amqp-connection-manager/lib/AmqpConnectionManager'

import { ChannelWrapper } from './channel-wrapper'

export default class AmqpConnectionManager extends ConnectionManager {
  async createChannel(options = {}) {
    // @ts-ignore
    const channel = new ChannelWrapper(this, options)

    // @ts-ignore
    this._channels.push(channel)

    channel.once('close', () => {
      // @ts-ignore
      this._channels = this._channels.filter((c) => c !== channel)
    })

    await channel.waitForConnect()

    channel._startWorker()

    return channel
  }
}
