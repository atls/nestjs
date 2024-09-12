import { Module }              from '@nestjs/common'

import { GrpcHttpProxyModule } from '../../src'
import { NopeAuthenticator }   from './nope.authenticator'
import { TestController }      from './test.controller'
import { serverOptions }       from './proto.options'

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
