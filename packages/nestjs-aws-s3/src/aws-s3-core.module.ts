import { S3 }                            from 'aws-sdk'

import { DynamicModule, Global, Module } from '@nestjs/common'

import { AWS_S3_OPTIONS }                from './aws-s3.constants'
import { AwsS3Service }                  from './aws-s3.service'

@Global()
@Module({})
export class AwsS3CoreModule {
  public static forRoot(options: S3.ClientConfiguration): DynamicModule {
    return {
      module: AwsS3CoreModule,
      providers: [{ provide: AWS_S3_OPTIONS, useValue: options }, AwsS3Service],
      exports: [AwsS3Service],
    }
  }
}
