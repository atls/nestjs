import type { Request }       from 'express'
import type { Response }      from 'express'

import type { Authenticator } from './authenticator.interface.js'

import { promises as fs }     from 'node:fs'

import { v4 as uuid }         from 'uuid'
import cookie                 from 'cookie'
import jwt                    from 'jsonwebtoken'

export class PrivateKeyAuthenticator implements Authenticator {
  constructor(private readonly privateKey?: string) {
    if (!this.privateKey) {
      throw new Error('PrivateKeyAuthenticator: private key not found')
    }
  }

  async execute(req: Request, res: Response): Promise<string | null> {
    if (this.privateKey) {
      const cookies = cookie.parse(req.headers.cookie || '')
      const subject = cookies.subject || uuid()

      if (!cookies.subject) {
        res.setHeader(
          'Set-Cookie',
          cookie.serialize('subject', String(subject), {
            maxAge: 60 * 60 * 24 * 7,
            httpOnly: true,
            path: '/',
          })
        )
      }

      const privateKey = await fs.readFile(this.privateKey, 'utf-8')

      const token = jwt.sign({ sub: subject }, privateKey, { algorithm: 'RS256' })

      return `Bearer ${token}`
    }

    return null
  }
}
