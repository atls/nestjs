import type { S3ClientModuleOptions } from './s3-client.module.interfaces.js'

import { S3Client }                   from '@aws-sdk/client-s3'
import { Injectable }                 from '@nestjs/common'

import { S3ClientConfigFactory }      from './s3-client.config-factory.js'

@Injectable()
export class S3ClientFactory {
  constructor(private readonly configFactory: S3ClientConfigFactory) {}

  create(options: S3ClientModuleOptions = {}): S3Client {
    return new S3Client(this.configFactory.createS3ClientOptions(options))
  }
}
