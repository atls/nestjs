import { Module }                from '@nestjs/common'

import { KratosModule }          from '../../src/index.js'
import { RedirectController }    from './redirect.controller.js'
import { SelfServiceController } from './self-service.controller.js'
import { SessionController }     from './session.controller.js'

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
