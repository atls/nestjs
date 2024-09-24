import type { Authenticator } from '../../src/index.js'

export class NopeAuthenticator implements Authenticator {
  async execute(): Promise<string> {
    return Promise.resolve('nope')
  }
}
