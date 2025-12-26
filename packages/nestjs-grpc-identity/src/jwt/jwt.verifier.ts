import type { JwtPayload } from 'jsonwebtoken'

import { Injectable }      from '@nestjs/common'
import { JwksClient }      from 'jwks-rsa'
import jwt                 from 'jsonwebtoken'

@Injectable()
export class JwtVerifier {
  constructor(private readonly jwksClient: JwksClient) {}

  async verify(token: string): Promise<JwtPayload | string | null> {
    try {
      const dtoken = jwt.decode(token, { complete: true })

      if (!dtoken || typeof dtoken !== 'object' || !('header' in dtoken) || !dtoken.header.kid) {
        return null
      }

      const key = await this.jwksClient.getSigningKey(dtoken.header.kid)
      const publicKey = key.getPublicKey()

      if (!publicKey) {
        return null
      }

      const decoded = jwt.verify(token, publicKey)

      if (decoded && typeof decoded === 'object' && 'sub' in decoded) {
        return decoded
      }

      return null
    } catch {
      return null
    }
  }
}
