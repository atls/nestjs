import { DynamicModule, Module } from '@nestjs/common'
import { S3 }                    from 'aws-sdk'

import { AwsS3CoreModule }       from './aws-s3-core.module'

@Module({})
export class AwsS3Module {
  public static forRoot(options: S3.ClientConfiguration): DynamicModule {
    return {
      module: AwsS3Module,
      imports: [AwsS3CoreModule.forRoot(options)],
    }
  }
}
