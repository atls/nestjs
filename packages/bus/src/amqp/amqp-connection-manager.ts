/* eslint-disable no-underscore-dangle */

import ConnectionManager  from 'amqp-connection-manager/lib/AmqpConnectionManager'

import { ChannelWrapper } from './channel-wrapper'

export default class AmqpConnectionManager extends ConnectionManager {
  async createChannel(options = {}) {
    // @ts-ignore
    const channel = new ChannelWrapper(this, options)

    // @ts-ignore
    this._channels.push(channel)

    // @ts-ignore
    channel.once('close', () => {
      // @ts-ignore
      this._channels = this._channels.filter((c) => c !== channel)
    })

    // @ts-ignore
    await channel.waitForConnect()

    // @ts-ignore
    channel._startWorker()

    return channel
  }
}
