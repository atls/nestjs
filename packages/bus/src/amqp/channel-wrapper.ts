/* eslint-disable */

import ManagerWrapper from 'amqp-connection-manager/lib/ChannelWrapper'
import pb             from 'promise-breaker'

export class ChannelWrapper extends ManagerWrapper {
  reject() {
    // @ts-ignore
    this._channel.reject.apply(this._channel, arguments)
  }

  get() {
    // @ts-ignore
    if (!this._channel) {
      return false
    }

    // @ts-ignore
    return this._channel && this._channel.get.apply(this._channel, arguments)
  }

  _onConnect({ connection }) {
    // @ts-ignore
    this._connection = connection

    return connection
      .createConfirmChannel()
      .then((channel) => {
        // @ts-ignore
        this._channel = channel

        // @ts-ignore
        channel.on('close', () => this._onChannelClose(channel))

        // @ts-ignore
        this._settingUp = Promise.all(
          // @ts-ignore
          this._setups.map((setupFn) =>
            // @ts-ignore
            pb.call(setupFn, this, channel).catch((err) => {
              // @ts-ignore
              if (this._channel) {
                // @ts-ignore
                this.emit('error', err, { name: this.name })
              } else {
                // Don't emit an error if setups failed because the channel was closing.
              }
            })
          )
        ).then(() => {
          // @ts-ignore
          this._settingUp = null
          // @ts-ignore
          return this._channel
        })

        // @ts-ignore
        return this._settingUp
      })
      .then(() => {
        // @ts-ignore
        if (!this._channel) {
          // Can happen if channel closes while we're setting up.
          return
        }

        // @ts-ignore
        if (this._unconfirmedMessages.length > 0) {
          // requeu any messages that were left unconfirmed when connection was lost
          // @ts-ignore
          while (this._unconfirmedMessages.length) {
            // @ts-ignore
            this._messages.push(this._unconfirmedMessages.shift())
          }
        }

        // @ts-ignore
        //this._startWorker();

        // @ts-ignore
        this.emit('connect')
      })
      .catch((err) => {
        // @ts-ignore
        this.emit('error', err, { name: this.name })
        // @ts-ignore
        this._settingUp = null
        // @ts-ignore
        this._channel = null
      })
  }
}
