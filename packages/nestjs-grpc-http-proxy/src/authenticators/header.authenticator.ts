import type { Request }       from 'express'

import type { Authenticator } from './authenticator.interface.js'

export class HeaderAuthenticator implements Authenticator {
  async execute(req: Request): Promise<string | null> {
    return req.headers.authorization || null
  }
}
