import { Authenticator } from '../../src'

export class NopeAuthenticator implements Authenticator {
  execute() {
    return Promise.resolve('nope')
  }
}
