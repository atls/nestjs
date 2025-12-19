import type { GrpcIdentityOptionsFactory } from '../module/index.js'
import type { GrpcIdentityModuleOptions }  from '../module/index.js'

import { promises as fs }                  from 'node:fs'

export class GrpcIdentityEnvConfig implements GrpcIdentityOptionsFactory {
  getJwksOptions(): GrpcIdentityModuleOptions['jwks'] {
    const jwksUri = process.env.IDENTITY_JWKS_URI

    if (!jwksUri) {
      throw new Error(`Identity JwksUri configuration not found.`)
    }

    const options: GrpcIdentityModuleOptions['jwks'] & {
      fetcher?: (uri: string) => Promise<unknown>
    } = {
      jwksUri,
      rateLimit: true,
      cache: true,
    }

    if (!jwksUri.startsWith('http')) {
      options.fetcher = async (uri: string): Promise<{ keys: any }> =>
        JSON.parse(await fs.readFile(uri, 'utf-8'))
    }

    return options
  }

  createGrpcIdentityOptions(): GrpcIdentityModuleOptions {
    return {
      jwks: this.getJwksOptions(),
    }
  }
}
