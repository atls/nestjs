import { Module }                from '@nestjs/common'

import { KratosModule }          from '../../src'
import { RedirectController }    from './redirect.controller'
import { SelfServiceController } from './self-service.controller'
import { SessionController }     from './session.controller'

@Module({
  imports: [
    KratosModule.register({
      browser: 'http://localhost:3000',
      public: 'http://localhost:3000',
    }),
  ],
  controllers: [RedirectController, SelfServiceController, SessionController],
})
export class KratosIntegrationModule {}
