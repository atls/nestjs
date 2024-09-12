import { Request }       from 'express'

import { Authenticator } from './authenticator.interface.js'

export class HeaderAuthenticator implements Authenticator {
  async execute(req: Request) {
    return req.headers.authorization || null
  }
}
