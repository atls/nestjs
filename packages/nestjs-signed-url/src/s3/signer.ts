import type { SignedUrlGateway }        from '../interfaces.js'
import type { S3SignedUrlReadOptions }  from './interfaces.js'
import type { S3SignedUrlSigning }      from './interfaces.js'
import type { S3SignedUrlWriteOptions } from './interfaces.js'

import { Inject }                       from '@nestjs/common'
import { Injectable }                   from '@nestjs/common'

import { SIGNED_URL_GATEWAY }           from '../constants.js'
import { SignedUrlSigner }              from '../signer.js'

@Injectable()
export class S3SignedUrlSigner
  extends SignedUrlSigner<S3SignedUrlReadOptions, S3SignedUrlWriteOptions>
  implements S3SignedUrlSigning
{
  constructor(
    @Inject(SIGNED_URL_GATEWAY)
    gateway: SignedUrlGateway<S3SignedUrlReadOptions, S3SignedUrlWriteOptions>
  ) {
    super(gateway)
  }
}
