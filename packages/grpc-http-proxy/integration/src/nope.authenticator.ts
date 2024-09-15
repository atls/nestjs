import { Authenticator } from '../../src/index.js'

export class NopeAuthenticator implements Authenticator {
  execute() {
    return Promise.resolve('nope')
  }
}
