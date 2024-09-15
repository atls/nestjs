import { Module }              from '@nestjs/common'

import { GrpcHttpProxyModule } from '../../src/index.js'
import { NopeAuthenticator }   from './nope.authenticator.js'
import { TestController }      from './test.controller.js'
import { serverOptions }       from './proto.options.js'

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
