import { Module }              from '@nestjs/common'

import { GrpcHttpProxyModule } from '../../src'
import { serverOptions }       from './proto.options'
import { TestController }      from './test.controller'
import { NopeAuthenticator }   from './nope.authenticator'

@Module({
  imports: [
    GrpcHttpProxyModule.register({
      options: serverOptions.options,
      authenticator: new NopeAuthenticator(),
    }),
  ],
  controllers: [TestController],
})
export class GrpcHttpProxyIntegrationModule {}
