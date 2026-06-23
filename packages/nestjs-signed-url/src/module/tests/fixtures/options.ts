import type { SignedUrlGateway }              from '../../../interfaces.js'
import type { SignedUrlModuleOptions }        from '../../interfaces.js'
import type { SignedUrlModuleOptionsFactory } from '../../interfaces.js'

import { Inject }                             from '@nestjs/common'
import { Injectable }                         from '@nestjs/common'

import { TESTING_SIGNED_URL_GATEWAY }         from './constants.js'

@Injectable()
export class TestingSignedUrlOptionsFactory implements SignedUrlModuleOptionsFactory {
  constructor(
    @Inject(TESTING_SIGNED_URL_GATEWAY)
    private readonly gateway: SignedUrlGateway
  ) {}

  createSignedUrlModuleOptions(): SignedUrlModuleOptions {
    return {
      gateway: this.gateway,
    }
  }
}
