import { DynamicModule }    from '@nestjs/common'
import { Module }           from '@nestjs/common'

import { SignedUrlService } from './services'
import { GcsStorage }       from './storage'
import { STORAGE }          from './storage'

@Module({})
export class SignedUrlModule {
  static gcs(): DynamicModule {
    const storageProvider = {
      provide: STORAGE,
      useFactory: () => new GcsStorage(),
    }

    return {
      module: SignedUrlModule,
      providers: [SignedUrlService, storageProvider],
      exports: [SignedUrlService],
    }
  }
}
