import type { HydraOptionsFactory } from '../module/index.js'
import type { HydraModuleOptions }  from '../module/index.js'

export class HydraEnvConfig implements HydraOptionsFactory {
  createHydraOptions(): HydraModuleOptions {
    if (!process.env.HYDRA_ADMIN_URL) {
      throw new Error('HYDRA_ADMIN_URL configuration variable required')
    }

    return {
      urls: {
        admin: process.env.HYDRA_ADMIN_URL,
      },
      tls: {
        termination: process.env.HYDRA_TLS_TERMINATION !== 'false',
      },
    }
  }
}
