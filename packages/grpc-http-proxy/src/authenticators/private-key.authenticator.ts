import { Request }        from 'express'
import { Response }       from 'express'
import { promises as fs } from 'fs'
import { sign }           from 'jsonwebtoken'
import { v4 as uuid }     from 'uuid'
import cookie             from 'cookie'

import { Authenticator }  from './authenticator.interface'

export class PrivateKeyAuthenticator implements Authenticator {
  constructor(private readonly privateKey?: string) {
    if (!this.privateKey) {
      throw new Error('PrivateKeyAuthenticator: private key not found')
    }
  }

  async execute(req: Request, res: Response) {
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

      const token = sign({ sub: subject }, privateKey, { algorithm: 'RS256' })

      return `Bearer ${token}`
    }

    return null
  }
}
