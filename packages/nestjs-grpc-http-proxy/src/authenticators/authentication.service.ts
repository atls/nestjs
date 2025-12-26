import type { Request }                    from 'express'
import type { Response }                   from 'express'

import type { GrpcHttpProxyModuleOptions } from '../module/index.js'

import { Injectable }                      from '@nestjs/common'
import { Inject }                          from '@nestjs/common'

import { GRPC_HTTP_PROXY_MODULE_OPTIONS }  from '../module/index.js'

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(GRPC_HTTP_PROXY_MODULE_OPTIONS) private readonly options: GrpcHttpProxyModuleOptions
  ) {}

  async authenticate(req: Request, res: Response): Promise<string | null> {
    if (!this.options.authenticator) {
      return null
    }

    return this.options.authenticator.execute(req, res)
  }
}
