import type { StorageOptions }         from '@google-cloud/storage'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { GcsClientModuleOptions } from './gcs-client.module.interfaces.js'

import { Injectable }                  from '@nestjs/common'
import { Inject }                      from '@nestjs/common'

import { GCS_CLIENT_MODULE_OPTIONS }   from './gcs-client.module.constants.js'

@Injectable()
export class GcsClientConfigFactory {
  constructor(
    @Inject(GCS_CLIENT_MODULE_OPTIONS)
    private readonly options: GcsClientModuleOptions
  ) {}

  createGcsClientOptions(options: GcsClientModuleOptions = {}): StorageOptions {
    return {
      apiEndpoint: options.apiEndpoint || this.options.apiEndpoint || process.env.GCS_API_ENDPOINT,
      keyFilename: options.keyFilename || this.options.keyFilename || process.env.GCS_KEY_FILENAME,
    }
  }
}
