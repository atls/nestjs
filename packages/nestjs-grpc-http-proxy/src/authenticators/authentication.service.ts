import { Injectable }                     from '@nestjs/common'
import { Inject }                         from '@nestjs/common'

import { Request }                        from 'express'
import { Response }                       from 'express'

import { GrpcHttpProxyModuleOptions }     from '../module/grpc-http-proxy-module-options.interface'
import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from '../module/grpc-http-proxy.constants'

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(GRPC_HTTP_PROXY_MODULE_OPTIONS) private readonly options: GrpcHttpProxyModuleOptions
  ) {}

  authenticate(req: Request, res: Response) {
    if (!this.options.authenticator) {
      return null
    }

    return this.options.authenticator.execute(req, res)
  }
}
