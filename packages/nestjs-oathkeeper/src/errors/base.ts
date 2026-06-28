import type { OathkeeperErrorMessage } from './messages.js'

export class OathkeeperError extends Error {
  constructor(message: OathkeeperErrorMessage | string, options?: ErrorOptions) {
    super(message, options)

    this.name = new.target.name
  }
}
