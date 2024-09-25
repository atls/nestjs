import type { KratosOptionsFactory } from '../module/index.js'
import type { KratosModuleOptions }  from '../module/index.js'

export class KratosEnvConfig implements KratosOptionsFactory {
  createKratosOptions(): KratosModuleOptions {
    if (!process.env.KRATOS_BROWSER_URL) {
      throw new Error('KRATOS_BROWSER_URL configuration variable required')
    }

    if (!process.env.PUBLIC_BROWSER_URL) {
      throw new Error('PUBLIC_BROWSER_URL configuration variable required')
    }

    return {
      browser: process.env.KRATOS_BROWSER_URL,
      public: process.env.PUBLIC_BROWSER_URL,
    }
  }
}
