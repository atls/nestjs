import type { Storage }          from '@google-cloud/storage'
import type { DynamicModule }    from '@nestjs/common'
import type { Provider }         from '@nestjs/common'

import { Module }                from '@nestjs/common'

import { SIGNED_URL_PROVIDER }   from './constants.js'
import { GCS_SIGNED_URL_CLIENT } from './gcs/index.js'
import { GcsSignedUrlGateway }   from './gcs/index.js'
import { SignedUrlSigner }       from './signer.js'

@Module({})
export class SignedUrlModule {
  static gcs(client: Storage): DynamicModule {
    const clientProvider: Provider<Storage> = {
      provide: GCS_SIGNED_URL_CLIENT,
      useValue: client,
    }

    const signedUrlProvider: Provider = {
      provide: SIGNED_URL_PROVIDER,
      useExisting: GcsSignedUrlGateway,
    }

    return {
      module: SignedUrlModule,
      providers: [SignedUrlSigner, clientProvider, GcsSignedUrlGateway, signedUrlProvider],
      exports: [SignedUrlSigner],
    }
  }
}
