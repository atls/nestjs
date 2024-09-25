import type { GrpcIdentityOptionsFactory } from '../module/index.js'
import type { GrpcIdentityModuleOptions }  from '../module/index.js'

import { promises as fs }                  from 'fs'

export class GrpcIdentityEnvConfig implements GrpcIdentityOptionsFactory {
  getJwksOptions(): GrpcIdentityModuleOptions['jwks'] {
    const jwksUri = process.env.IDENTITY_JWKS_URI

    if (!jwksUri) {
      throw new Error(`Identity JwksUri configuration not found.`)
    }

    const options = {
      jwksUri,
      rateLimit: true,
      cache: true,
    }

    if (!jwksUri.startsWith('http')) {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument
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
