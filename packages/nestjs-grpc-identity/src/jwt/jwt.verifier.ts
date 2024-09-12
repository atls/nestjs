import { Injectable } from '@nestjs/common'
import { JwksClient } from 'jwks-rsa'
import { decode }     from 'jsonwebtoken'
import { verify }     from 'jsonwebtoken'

@Injectable()
export class JwtVerifier {
  constructor(private readonly jwksClient: JwksClient) {}

  async verify(token: string) {
    try {
      const dtoken = decode(token, { complete: true })

      const key = await this.jwksClient.getSigningKey(dtoken?.header?.kid)

      // @ts-ignore
      const decoded = verify(token, key.publicKey || key.rsaPublicKey)

      // @ts-ignore
      if (decoded?.sub) {
        return decoded
      }

      return null
    } catch {
      return null
    }
  }
}
