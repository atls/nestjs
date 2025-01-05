import type { S3ClientConfig }        from '@aws-sdk/client-s3'

 
import type { S3ClientModuleOptions } from './s3-client.module.interfaces.js'

import { Inject }                     from '@nestjs/common'
import { Injectable }                 from '@nestjs/common'
import { fromEnv }                    from '@aws-sdk/credential-providers'

import { S3_CLIENT_MODULE_OPTIONS }   from './s3-client.module.constants.js'

@Injectable()
export class S3ClientConfigFactory {
  constructor(
    @Inject(S3_CLIENT_MODULE_OPTIONS)
    private readonly options: S3ClientModuleOptions
  ) {}

  createS3ClientOptions(options: S3ClientModuleOptions = {}): S3ClientConfig {
    return {
      endpoint: options.endpoint || this.options.endpoint || process.env.S3_ENDPOINT,
      region: options.region || this.options.region || process.env.S3_REGION,
      credentials: options.credentials || this.options.credentials || fromEnv(),
      forcePathStyle: true,
    }
  }
}
