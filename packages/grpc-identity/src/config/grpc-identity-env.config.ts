import { promises as fs }             from 'fs'

import { GrpcIdentityOptionsFactory } from '../module'
import { GrpcIdentityModuleOptions }  from '../module'

export class GrpcIdentityEnvConfig implements GrpcIdentityOptionsFactory {
  getJwksOptions() {
    const jwksUri = process.env.IDENTITY_JWKS_URI

    if (!jwksUri) {
      throw new Error('Identity JwksUri configuration not found.')
    }

    const options = {
      jwksUri,
      rateLimit: true,
      cache: true,
    }

    if (!jwksUri.startsWith('http')) {
      // @ts-ignore
      options.fetcher = async (uri) => JSON.parse(await fs.readFile(uri, 'utf-8'))
    }

    return options
  }

  createGrpcIdentityOptions(): GrpcIdentityModuleOptions {
    return {
      jwks: this.getJwksOptions(),
    }
  }
}
