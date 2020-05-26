import { Inject, Injectable } from '@nestjs/common'
import { S3 }                 from 'aws-sdk'

import { AWS_S3_OPTIONS }     from './aws-s3.constants'

@Injectable()
export class AwsS3Service extends S3 {
  constructor(@Inject(AWS_S3_OPTIONS) options: S3.ClientConfiguration) {
    super(options)
  }
}
