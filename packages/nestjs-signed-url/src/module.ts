import { DynamicModule, Module } from '@nestjs/common'

import { SignedUrlService }      from './services'
import { GcsStorage, STORAGE }   from './storage'

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
