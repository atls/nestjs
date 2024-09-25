import type { JwtPayload } from 'jsonwebtoken'

import { Injectable }      from '@nestjs/common'
import { JwksClient }      from 'jwks-rsa'
import { decode }          from 'jsonwebtoken'
import { verify }          from 'jsonwebtoken'

@Injectable()
export class JwtVerifier {
  constructor(private readonly jwksClient: JwksClient) {}

  async verify(token: string): Promise<JwtPayload | string | null> {
    try {
      const dtoken = decode(token, { complete: true })

      const key = await this.jwksClient.getSigningKey(dtoken?.header?.kid)

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const decoded = verify(token, key.publicKey || key.rsaPublicKey)

      if (decoded?.sub) {
        return decoded
      }

      return null
    } catch {
      return null
    }
  }
}
