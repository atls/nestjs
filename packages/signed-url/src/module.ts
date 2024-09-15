import { DynamicModule }    from '@nestjs/common'
import { Module }           from '@nestjs/common'

import { SignedUrlService } from './services/index.js'
import { GcsStorage }       from './storage/index.js'
import { STORAGE }          from './storage/index.js'

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
